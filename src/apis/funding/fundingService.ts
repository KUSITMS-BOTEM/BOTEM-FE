import { clientApi } from "@/apis/client";
import type { FundingRevealResponse } from "@/types/funding/funding";

export const fundingService = {
  getReveal: (fundingId: number) =>
    clientApi.get<FundingRevealResponse>(`/api/fundings/${fundingId}/reveal`),
};
