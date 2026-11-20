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
  // 로컬 개발용: 로그인 회원은 보탠 내역이 있다. 비어 있는 상태(보태기 버튼)는 이 핸들러를 바꿔 확인한다
  http.get("*/api/fundings/:fundingId/contributions/me", async () => {
    await delay(400);
    return HttpResponse.json({
      success: true,
      data: {
        editable: true,
        contributions: [
          {
            contributionId: 21,
            participantName: "민지",
            amount: 30000,
            status: "PENDING_CONFIRMATION",
            excludedFromResult: false,
            message: "지유야 생일 축하해!",
            paperTemplateCode: "LIME_DOT_GRID",
            decorationCode: "PARTY_POPPER",
            photoUrl: null,
            voiceUrl: null,
            voiceDurationSeconds: null,
            participatedAt: "2026-11-18T11:20:00",
            payoutAccount: null,
          },
        ],
      },
      error: null,
    });
  }),
  // 로컬 개발용: 이름 "민지" + 비밀번호 "1234"만 일치한다. 다른 값은 서버처럼 FUNDING_025(403)
  http.post("*/api/fundings/:fundingId/contributions/guest/access", async ({ request }) => {
    await delay(400);
    const { participantName, guestPassword } = (await request.json()) as {
      participantName: string;
      guestPassword: string;
    };
    if (participantName !== "민지" || guestPassword !== "1234") {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: { code: "FUNDING_025", message: "비밀번호가 일치하지 않습니다.", detail: null },
        },
        { status: 403 },
      );
    }
    return HttpResponse.json({
      success: true,
      data: {
        contributionId: 31,
        participantName,
        amount: 10000,
        status: "PENDING_CONFIRMATION",
        message: "생일 축하해!",
        paperTemplateCode: "BLUE_DOT_GRID",
        decorationCode: "PARTY_POPPER",
        photoUrl: null,
        voiceUrl: null,
        voiceDurationSeconds: null,
        accessToken: "mock-guest-token",
        accessTokenExpiresAt: "2026-12-31T00:00:00Z",
      },
      error: null,
    });
  }),
  // 로컬 개발용: 업로드 URL과 S3 PUT(userService.msw의 mock-s3 핸들러)까지 모두 모킹한다. 실제 S3 업로드는 MSW를 끄고 확인한다. MSW 서비스 워커가 실제 S3 PUT을 대신 보내면 요청이 달라져 403이 난다
  http.post(
    "*/api/fundings/:fundingId/rolling-paper-attachments/upload-url",
    async ({ request }) => {
      const { attachmentType } = (await request.json()) as { attachmentType: string };
      const url = `https://mock-s3.botem.local/rolling-paper/${attachmentType.toLowerCase()}/mock-upload-token`;
      return HttpResponse.json({
        success: true,
        data: { attachmentType, uploadUrl: url, fileUrl: url },
        error: null,
      });
    },
  ),
  http.post("*/api/fundings/:fundingId/contributions/message-only", async ({ request }) => {
    await delay(500);
    const { participantName } = (await request.json()) as { participantName?: string };
    return HttpResponse.json({
      success: true,
      data: {
        contributionId: 99,
        participantName: participantName ?? "회원",
        status: "MESSAGE_ONLY",
      },
      error: null,
    });
  }),
  http.post("*/api/fundings/:fundingId/contributions", async ({ request }) => {
    await delay(500);
    const { participantName, amount } = (await request.json()) as {
      participantName?: string;
      amount: number;
    };
    return HttpResponse.json({
      success: true,
      data: {
        contributionId: 98,
        participantName: participantName ?? "회원",
        amount,
        status: "AWAITING_TRANSFER",
        payoutAccount: {
          bank: "TOSS_BANK",
          bankName: "토스뱅크",
          accountNumber: "1000-1234-5678",
          accountHolder: "김민재",
        },
      },
      error: null,
    });
  }),
  http.post("*/api/fundings/:fundingId/contributions/:contributionId/transfer-sent", async () => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: { contributionId: 98, status: "PENDING_CONFIRMATION" },
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
