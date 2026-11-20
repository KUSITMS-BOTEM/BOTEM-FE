import { clientApi, reissue } from "@/apis/client";
import { useAuthStore } from "@/store/authStore";
import { ApiError, REISSUE_UNAVAILABLE } from "@/types/api";
import type { ClosedFundingListResponse } from "@/types/funding/closedFunding";
import type {
  CreateFundingRequest,
  CreateFundingResponse,
  CreateSurpriseFundingRequest,
} from "@/types/funding/funding";
import type { FundingDetailResponse } from "@/types/funding/fundingDetail";
import type {
  ChangeFundingProductRequest,
  ChangeFundingProductResponse,
  CloseFundingResponse,
  ExtendFundingRequest,
  ExtendFundingResponse,
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
import type { OwnerFundingDetailResponse } from "@/types/funding/ownerFundingDetail";

export const fundingService = {
  getClosedFundings: () =>
    clientApi.get<ClosedFundingListResponse>("/api/users/me/fundings/closed"),
  postFunding: (body: CreateFundingRequest) =>
    clientApi.post<CreateFundingResponse>("/api/fundings", body),
  postSurpriseFunding: (body: CreateSurpriseFundingRequest) =>
    clientApi.post<CreateFundingResponse>("/api/fundings/surprise", body),

  getFundingDetail: (fundingId: number) =>
    clientApi.get<FundingDetailResponse>(`/api/fundings/${fundingId}`),
  // 로그인 여부로 응답(ownerPreview)이 갈리는 선택 인증 API라, 새로고침으로 메모리 토큰이 비었으면 먼저 재발급해 헤더를 붙인다.
  // 토큰이 없으면 401 없이 비로그인 응답이 와서 clientApi의 재발급이 동작하지 않기 때문이다
  getFundingDetailAsMember: async (fundingId: number) => {
    if (!useAuthStore.getState().accessToken) {
      try {
        useAuthStore.getState().setAccessToken((await reissue()).accessToken);
      } catch (error) {
        // 일시 장애는 호출부가 다시 시도하게 둔다. 인증이 거부된 경우(refreshToken 만료)는 공개 화면이라 비로그인으로 조회한다
        if (error instanceof ApiError && error.code === REISSUE_UNAVAILABLE) throw error;
      }
    }
    return fundingService.getFundingDetail(fundingId);
  },
  getFundingManagement: (fundingId: number) =>
    clientApi.get<OwnerFundingDetailResponse>(`/api/fundings/${fundingId}/management`),
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
