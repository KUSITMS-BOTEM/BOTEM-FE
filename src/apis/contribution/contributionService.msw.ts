import { delay, http, HttpResponse } from "msw";

import {
  getMockContributionProgress,
  getMockContributionStatus,
  getMockPendingContributionIds,
  getMockPendingContributions,
  updateMockContributionStatuses,
} from "@/mocks/mockContributions";

const errorResponse = (status: number, code: string, message: string) =>
  HttpResponse.json({ success: false, data: null, error: { code, message } }, { status });

// mock은 펀딩의 기존 확정 달성률을 모르므로 이번 목업 보탬으로 확정된 몫만 confirmedPercentage에 담는다
const toProgress = (fundingId: number) => {
  const progress = getMockContributionProgress(fundingId);
  return {
    confirmedPercentage: progress.confirmedAddedPercentage,
    pendingPercentage: progress.pendingPercentage,
    pendingContributionCount: progress.pendingContributionCount,
    targetReached: false,
  };
};

const decideContribution =
  (status: "CONFIRMED" | "REJECTED") =>
  async ({ params }: { params: Record<string, string | readonly string[] | undefined> }) => {
    await delay(300);
    const fundingId = Number(params.fundingId);
    const contributionId = Number(params.contributionId);
    const current = getMockContributionStatus(fundingId, contributionId);
    if (current === null) return errorResponse(404, "FUNDING_023", "참여 내역을 찾을 수 없습니다.");
    if (current !== "PENDING_CONFIRMATION" && current !== status)
      return errorResponse(409, "FUNDING_030", "입금 확인 대기 중인 참여만 처리할 수 있습니다.");
    updateMockContributionStatuses(fundingId, [contributionId], status);
    return HttpResponse.json({
      success: true,
      data: { contributionId, status, progress: toProgress(fundingId) },
      error: null,
    });
  };

export const contributionHandlers = [
  http.get("*/api/fundings/:fundingId/contributions/pending", async ({ params }) => {
    await delay(800);
    const contributions = getMockPendingContributions(Number(params.fundingId));
    return HttpResponse.json({
      success: true,
      data: { pendingContributionCount: contributions.length, contributions },
      error: null,
    });
  }),
  http.post(
    "*/api/fundings/:fundingId/contributions/:contributionId/confirm",
    decideContribution("CONFIRMED"),
  ),
  http.post(
    "*/api/fundings/:fundingId/contributions/:contributionId/reject",
    decideContribution("REJECTED"),
  ),
  http.post("*/api/fundings/:fundingId/contributions/confirm-all", async ({ params }) => {
    await delay(300);
    const fundingId = Number(params.fundingId);
    const pendingIds = getMockPendingContributionIds(fundingId);
    updateMockContributionStatuses(fundingId, pendingIds, "CONFIRMED");
    return HttpResponse.json({
      success: true,
      data: { confirmedCount: pendingIds.length, progress: toProgress(fundingId) },
      error: null,
    });
  }),
];
