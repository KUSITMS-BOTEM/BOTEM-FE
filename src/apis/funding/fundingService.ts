import { clientApi } from "@/apis/client";
import type { ClosedFundingListResponse } from "@/types/funding/closedFunding";
import type {
  ChangeFundingProductRequest,
  ChangeFundingProductResponse,
  CreateFundingRequest,
  CreateFundingResponse,
  ExtendFundingRequest,
  ExtendFundingResponse,
  FundingManagementResponse,
  FundingResultResponse,
} from "@/types/funding/funding";

export const fundingService = {
  getClosedFundings: () =>
    clientApi.get<ClosedFundingListResponse>("/api/users/me/fundings/closed"),
  getResult: (fundingId: number) =>
    clientApi.get<FundingResultResponse>(`/api/fundings/${fundingId}/result`),
  getManagement: (fundingId: number) =>
    clientApi.get<FundingManagementResponse>(`/api/fundings/${fundingId}/management`),
  postResultOpen: (fundingId: number) =>
    clientApi.post<FundingResultResponse>(`/api/fundings/${fundingId}/result/open`),
  postFunding: (body: CreateFundingRequest) =>
    clientApi.post<CreateFundingResponse>("/api/fundings", body),
  patchProduct: (fundingId: number, body: ChangeFundingProductRequest) =>
    clientApi.patch<ChangeFundingProductResponse>(`/api/fundings/${fundingId}/product`, body),
  postExtension: (fundingId: number, body: ExtendFundingRequest) =>
    clientApi.post<ExtendFundingResponse>(`/api/fundings/${fundingId}/extension`, body),
};
