import { delay, http, HttpResponse } from "msw";

import type { UpdateContributionStatusRequest } from "@/types/contribution/contribution";
import {
  getMockPendingContributions,
  updateMockContributionStatuses,
} from "@/mocks/mockContributions";

export const contributionHandlers = [
  http.get("*/api/fundings/:fundingId/contributions/pending", async ({ params }) => {
    await delay(800);
    const contributions = getMockPendingContributions(Number(params.fundingId));
    // 홈 시트가 읽는 구 스펙 필드에 신 스펙(participantName 등)을 얹어, 두 화면이 같은 응답을 쓴다
    const withItemFields = contributions.map(contribution => ({
      ...contribution,
      participantName: contribution.senderName,
      profileImageUrl: null,
      participatedAt: "2026-11-18T11:20:00",
      amount: 30000,
    }));
    return HttpResponse.json({
      success: true,
      data: { pendingContributionCount: withItemFields.length, contributions: withItemFields },
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
  http.patch("*/api/fundings/:fundingId/contributions/status", async ({ params, request }) => {
    await delay(300);
    const { contributionIds, status } = (await request.json()) as UpdateContributionStatusRequest;
    if (!updateMockContributionStatuses(Number(params.fundingId), contributionIds, status)) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: { code: "CONTRIBUTION_NOT_FOUND", message: "해당 펀딩의 보탬이 아닙니다." },
        },
        { status: 404 },
      );
    }
    return HttpResponse.json({ success: true, data: null, error: null });
  }),
];
