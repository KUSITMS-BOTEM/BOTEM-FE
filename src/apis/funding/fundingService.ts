import { clientApi } from "@/apis/client";
import type { ClosedFundingListResponse } from "@/types/funding/closedFunding";
import type {
  CreateFundingRequest,
  CreateFundingResponse,
  CreateSurpriseFundingRequest,
  FundingRevealResponse,
} from "@/types/funding/funding";
import type { OwnerFundingDetailResponse } from "@/types/funding/ownerFundingDetail";

export const fundingService = {
  getClosedFundings: () =>
    clientApi.get<ClosedFundingListResponse>("/api/users/me/fundings/closed"),
  getReveal: (fundingId: number) =>
    clientApi.get<FundingRevealResponse>(`/api/fundings/${fundingId}/reveal`),
  getOwnerFundingDetail: (fundingId: number) =>
    clientApi.get<OwnerFundingDetailResponse>(`/api/fundings/${fundingId}/management`),
  postFunding: (body: CreateFundingRequest) =>
    clientApi.post<CreateFundingResponse>("/api/fundings", body),
  postSurpriseFunding: (body: CreateSurpriseFundingRequest) =>
    clientApi.post<CreateFundingResponse>("/api/fundings/surprise", body),
};
