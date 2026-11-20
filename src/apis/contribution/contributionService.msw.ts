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
