import { clientApi } from "@/apis/client";
import type { ClosedFundingListResponse } from "@/types/funding/closedFunding";
import type {
  CreateFundingRequest,
  CreateFundingResponse,
  CreateSurpriseFundingRequest,
  FundingRevealResponse,
} from "@/types/funding/funding";

export const fundingService = {
  getClosedFundings: () =>
    clientApi.get<ClosedFundingListResponse>("/api/users/me/fundings/closed"),
  getReveal: (fundingId: number) =>
    clientApi.get<FundingRevealResponse>(`/api/fundings/${fundingId}/reveal`),
  postFunding: (body: CreateFundingRequest) =>
    clientApi.post<CreateFundingResponse>("/api/fundings", body),
  postSurpriseFunding: (body: CreateSurpriseFundingRequest) =>
    clientApi.post<CreateFundingResponse>("/api/fundings/surprise", body),
};
