import { delay, http, HttpResponse } from "msw";

import {
  getMockContributionProgress,
  getMockContributionStatus,
  getMockPendingContributions,
  updateMockContributionStatuses,
} from "@/mocks/mockContributions";

const THANK_CARD_MESSAGE_MAX_LENGTH = 50;

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

const DECISION_STATUS = { CONFIRM: "CONFIRMED", REJECT: "REJECTED" } as const;

// 실서버처럼 하나라도 처리할 수 없으면 아무것도 바꾸지 않는다. 10초 실행 취소 제한(FUNDING_056)은 목에서 재현하지 않는다
const decideContributions = async ({
  params,
  request,
}: {
  params: Record<string, string | readonly string[] | undefined>;
  request: Request;
}) => {
  await delay(300);
  const fundingId = Number(params.fundingId);
  const { contributionIds, decision } = (await request.json()) as {
    contributionIds: number[];
    decision: keyof typeof DECISION_STATUS;
  };
  const status = DECISION_STATUS[decision];
  const currents = contributionIds.map(id => getMockContributionStatus(fundingId, id));
  if (currents.includes(null))
    return errorResponse(404, "FUNDING_023", "참여 내역을 찾을 수 없습니다.");
  if (currents.some(current => current !== "PENDING_CONFIRMATION" && current !== status))
    return errorResponse(409, "FUNDING_030", "입금 확인 대기 중인 참여만 처리할 수 있습니다.");
  updateMockContributionStatuses(fundingId, contributionIds, status);
  return HttpResponse.json({
    success: true,
    data: {
      contributions: contributionIds.map((contributionId, index) => ({
        contributionId,
        status,
        changed: currents[index] !== status,
      })),
      progress: toProgress(fundingId),
    },
    error: null,
  });
};

const undoContributionDecisions = async ({
  params,
  request,
}: {
  params: Record<string, string | readonly string[] | undefined>;
  request: Request;
}) => {
  await delay(300);
  const fundingId = Number(params.fundingId);
  const { contributionIds } = (await request.json()) as { contributionIds: number[] };
  const currents = contributionIds.map(id => getMockContributionStatus(fundingId, id));
  if (currents.includes(null))
    return errorResponse(404, "FUNDING_023", "참여 내역을 찾을 수 없습니다.");
  if (
    currents.some(
      current =>
        current !== "PENDING_CONFIRMATION" && current !== "CONFIRMED" && current !== "REJECTED",
    )
  )
    return errorResponse(
      409,
      "FUNDING_055",
      "받았어요·못 받았어요로 처리한 참여만 되돌릴 수 있습니다.",
    );
  updateMockContributionStatuses(fundingId, contributionIds, "PENDING_CONFIRMATION");
  return HttpResponse.json({
    success: true,
    data: {
      contributions: contributionIds.map((contributionId, index) => ({
        contributionId,
        status: "PENDING_CONFIRMATION",
        changed: currents[index] !== "PENDING_CONFIRMATION",
      })),
      progress: toProgress(fundingId),
    },
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
  http.post("*/api/fundings/:fundingId/contributions/decisions", decideContributions),
  http.post("*/api/fundings/:fundingId/contributions/decisions/undo", undoContributionDecisions),
  http.post(
    "*/api/fundings/:fundingId/contributions/:contributionId/thank-card",
    async ({ params, request }) => {
      await delay(300);
      const body = (await request.json()) as { message?: string; paperColor?: string };
      const message = body.message?.trim() ?? "";
      if (message.length === 0 || [...message].length > THANK_CARD_MESSAGE_MAX_LENGTH)
        return errorResponse(400, "COMMON_001", "감사카드 메시지는 1~50자로 입력해주세요.");
      const contributionId = Number(params.contributionId);
      return HttpResponse.json({
        success: true,
        data: {
          thankCardId: contributionId,
          contributionId,
          message,
          paperColor: body.paperColor ?? "LIME",
          sentAt: new Date().toISOString(),
          shareUrl: `https://botem.me/thank-cards/mock-${contributionId}`,
        },
        error: null,
      });
    },
  ),
];
