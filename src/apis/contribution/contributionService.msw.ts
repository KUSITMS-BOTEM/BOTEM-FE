import { delay, http, HttpResponse } from "msw";

import {
  getMockContributionProgress,
  getMockContributionStatus,
  getMockPendingContributionIds,
  getMockPendingContributions,
  updateMockContributionStatuses,
} from "@/mocks/mockContributions";

// 로컬 개발용: 이 세션에서 보탠 내 보탬. 제출 전에는 없고(보태기 플로우 확인용), 제출하면 /me가 돌려줘 수정 화면까지 이어 볼 수 있다. 새로고침하면 사라진다
let myContribution: Record<string, unknown> | null = null;

const toMyContribution = (created: Record<string, unknown>, body: Record<string, unknown>) => ({
  amount: 0,
  excludedFromResult: false,
  photoUrl: null,
  voiceUrl: null,
  voiceDurationSeconds: null,
  voiceTranscript: null,
  participatedAt: "2026-10-13T11:20:00",
  payoutAccount: null,
  ...created,
  message: body.message ?? null,
  paperTemplateCode: body.paperTemplateCode,
  decorationCode: body.decorationCode ?? null,
});

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
  http.get("*/api/fundings/share/:shareKey/contributions/me", async () => {
    await delay(400);
    return HttpResponse.json({
      success: true,
      data: { editable: true, contributions: myContribution ? [myContribution] : [] },
      error: null,
    });
  }),
  // 로컬 개발용: 이름 "민지" + 비밀번호 "1234"만 일치한다. 다른 값은 서버처럼 FUNDING_025(403)
  http.post("*/api/fundings/share/:shareKey/contributions/guest/access", async ({ request }) => {
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
  // 로컬 개발용: 접근 토큰 헤더가 없으면 서버처럼 FUNDING_033(401). 요청 body를 그대로 반영해 돌려준다
  http.patch("*/api/fundings/share/:shareKey/contributions/guest", async ({ request }) => {
    await delay(400);
    if (!request.headers.get("X-Guest-Contribution-Token")) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "FUNDING_033",
            message: "비회원 보탬 접근 토큰이 올바르지 않습니다.",
            detail: null,
          },
        },
        { status: 401 },
      );
    }
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      data: { contributionId: 31, amount: 10000, status: "PENDING_CONFIRMATION", ...body },
      error: null,
    });
  }),
  http.patch(
    "*/api/fundings/share/:shareKey/contributions/:contributionId",
    async ({ request, params }) => {
      await delay(400);
      const body = (await request.json()) as Record<string, unknown>;
      if (myContribution) myContribution = { ...myContribution, ...body };
      return HttpResponse.json({
        success: true,
        data: {
          contributionId: Number(params.contributionId),
          amount: 30000,
          status: "PENDING_CONFIRMATION",
          excludedFromResult: false,
          decorationCode: null,
          photoUrl: null,
          voiceUrl: null,
          voiceDurationSeconds: null,
          voiceTranscript: null,
          participatedAt: "2026-10-13T11:20:00",
          payoutAccount: null,
          ...body,
        },
        error: null,
      });
    },
  ),
  // 로컬 개발용: 업로드 URL과 S3 PUT(userService.msw의 mock-s3 핸들러)까지 모두 모킹한다. 실제 S3 업로드는 MSW를 끄고 확인한다. MSW 서비스 워커가 실제 S3 PUT을 대신 보내면 요청이 달라져 403이 난다
  http.post(
    "*/api/fundings/share/:shareKey/rolling-paper-attachments/upload-url",
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
  http.post("*/api/fundings/share/:shareKey/contributions/message-only", async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { participantName?: string };
    const data = {
      contributionId: 99,
      participantName: body.participantName ?? "회원",
      status: "MESSAGE_ONLY",
    };
    myContribution = toMyContribution(data, body);
    return HttpResponse.json({
      success: true,
      data,
      error: null,
    });
  }),
  http.post("*/api/fundings/share/:shareKey/contributions", async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { participantName?: string; amount: number };
    const data = {
      contributionId: 98,
      participantName: body.participantName ?? "회원",
      amount: body.amount,
      status: "AWAITING_TRANSFER",
      payoutAccount: {
        bank: "TOSS_BANK",
        bankName: "토스뱅크",
        accountNumber: "1000-1234-5678",
        accountHolder: "김민재",
      },
    };
    myContribution = toMyContribution(data, body);
    return HttpResponse.json({
      success: true,
      data,
      error: null,
    });
  }),
  http.post(
    "*/api/fundings/share/:shareKey/contributions/:contributionId/transfer-sent",
    async () => {
      await delay(300);
      return HttpResponse.json({
        success: true,
        data: { contributionId: 98, status: "PENDING_CONFIRMATION" },
        error: null,
      });
    },
  ),
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
