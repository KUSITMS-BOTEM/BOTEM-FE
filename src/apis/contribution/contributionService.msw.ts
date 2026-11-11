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
    return HttpResponse.json({ success: true, data: { contributions }, error: null });
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
