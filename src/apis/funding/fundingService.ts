import { clientApi } from "@/apis/client";
import type { ClosedFundingListResponse } from "@/types/funding/closedFunding";
import type {
  CreateFundingRequest,
  CreateFundingResponse,
  CreateSurpriseFundingRequest,
  FundingRevealResponse,
} from "@/types/funding/funding";
import type { FundingDetailResponse } from "@/types/funding/fundingDetail";
import type {
  ChangeFundingProductRequest,
  ChangeFundingProductResponse,
  CloseFundingResponse,
  ExtendFundingRequest,
  ExtendFundingResponse,
  FundingManagementResponse,
} from "@/types/funding/fundingManagement";
import type { FundingResultResponse } from "@/types/funding/fundingResult";
import type {
  CreateRollingPaperAttachmentUploadUrlRequest,
  RollingPaperAttachmentUploadUrlResponse,
} from "@/types/funding/rollingPaperAttachment";
import type {
  SendSurpriseThankCardRequest,
  SurpriseGiftPreparationResponse,
  SurpriseRevealResponse,
  SurpriseThankCardResponse,
} from "@/types/funding/surprise";

export const fundingService = {
  getClosedFundings: () =>
    clientApi.get<ClosedFundingListResponse>("/api/users/me/fundings/closed"),
  // TODO(API): Swagger에 없는 구 엔드포인트. 결과 API(getResult)에 참여자 이름이 추가되면 교체한다
  getReveal: (fundingId: number) =>
    clientApi.get<FundingRevealResponse>(`/api/fundings/${fundingId}/reveal`),
  postFunding: (body: CreateFundingRequest) =>
    clientApi.post<CreateFundingResponse>("/api/fundings", body),
  postSurpriseFunding: (body: CreateSurpriseFundingRequest) =>
    clientApi.post<CreateFundingResponse>("/api/fundings/surprise", body),

  getFundingDetail: (fundingId: number) =>
    clientApi.get<FundingDetailResponse>(`/api/fundings/${fundingId}`),
  getFundingManagement: (fundingId: number) =>
    clientApi.get<FundingManagementResponse>(`/api/fundings/${fundingId}/management`),
  closeFunding: (fundingId: number) =>
    clientApi.post<CloseFundingResponse>(`/api/fundings/${fundingId}/close`),
  extendFunding: (fundingId: number, body: ExtendFundingRequest) =>
    clientApi.post<ExtendFundingResponse>(`/api/fundings/${fundingId}/extension`, body),
  changeFundingProduct: (fundingId: number, body: ChangeFundingProductRequest) =>
    clientApi.patch<ChangeFundingProductResponse>(`/api/fundings/${fundingId}/product`, body),

  getResult: (fundingId: number) =>
    clientApi.get<FundingResultResponse>(`/api/fundings/${fundingId}/result`),
  openResult: (fundingId: number, excludePendingContributions = false) =>
    clientApi.post<FundingResultResponse>(`/api/fundings/${fundingId}/result/open`, undefined, {
      searchParams: { excludePendingContributions },
    }),

  getSurprise: (fundingId: number) =>
    clientApi.get<SurpriseRevealResponse>(`/api/fundings/${fundingId}/surprise`),
  openSurprise: (fundingId: number) =>
    clientApi.post<SurpriseRevealResponse>(`/api/fundings/${fundingId}/surprise/open`),
  sendSurpriseThankCard: (fundingId: number, body: SendSurpriseThankCardRequest) =>
    clientApi.post<SurpriseThankCardResponse>(
      `/api/fundings/${fundingId}/surprise/thank-card`,
      body,
    ),
  getSurpriseGiftPreparation: (fundingId: number) =>
    clientApi.get<SurpriseGiftPreparationResponse>(
      `/api/fundings/${fundingId}/surprise/gift-preparation`,
    ),
  completeSurpriseGiftPreparation: (fundingId: number, excludePendingContributions = false) =>
    clientApi.post<SurpriseGiftPreparationResponse>(
      `/api/fundings/${fundingId}/surprise/gift-preparation/complete`,
      undefined,
      { searchParams: { excludePendingContributions } },
    ),

  createRollingPaperAttachmentUploadUrl: (
    fundingId: number,
    body: CreateRollingPaperAttachmentUploadUrlRequest,
  ) =>
    clientApi.post<RollingPaperAttachmentUploadUrlResponse>(
      `/api/fundings/${fundingId}/rolling-paper-attachments/upload-url`,
      body,
    ),
};
