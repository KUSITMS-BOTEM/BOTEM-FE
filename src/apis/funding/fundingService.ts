import { clientApi } from "@/apis/client";
import type {
  CreateFundingRequest,
  CreateFundingResponse,
  CreateSurpriseFundingRequest,
  FundingRevealResponse,
} from "@/types/funding/funding";

export const fundingService = {
  getReveal: (fundingId: number) =>
    clientApi.get<FundingRevealResponse>(`/api/fundings/${fundingId}/reveal`),
  postFunding: (body: CreateFundingRequest) =>
    clientApi.post<CreateFundingResponse>("/api/fundings", body),
  postSurpriseFunding: (body: CreateSurpriseFundingRequest) =>
    clientApi.post<CreateFundingResponse>("/api/fundings/surprise", body),
};
