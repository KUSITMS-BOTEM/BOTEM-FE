import { clientApi } from "@/apis/client";
import type {
  AccessGuestContributionRequest,
  ConfirmAllContributionsResponse,
  ContributionDecisionResponse,
  ContributionThankCardResponse,
  CreateContributionRequest,
  CreateContributionResponse,
  CreateMessageContributionRequest,
  GuestContributionResponse,
  MarkTransferSentRequest,
  MarkTransferSentResponse,
  MessageContributionResponse,
  MyContributionListResponse,
  MyContributionResponse,
  PendingContributionItemListResponse,
  PendingContributionListResponse,
  SendContributionThankCardRequest,
  UpdateContributionStatusRequest,
  UpdatedGuestContributionResponse,
  UpdateGuestContributionRequest,
  UpdateMyContributionRequest,
} from "@/types/contribution/contribution";
import type { ThankCardResponse } from "@/types/thank-card/thankCard";

const GUEST_TOKEN_HEADER = "X-Guest-Contribution-Token";

const contributionsPath = (fundingId: number) => `/api/fundings/${fundingId}/contributions`;

export const contributionService = {
  // TODO(API): 응답 타입은 구 스펙. 바텀시트를 confirm/reject로 옮길 때 PendingContributionItemListResponse로 바꾼다
  getPendingContributions: (fundingId: number) =>
    clientApi.get<PendingContributionListResponse>(`${contributionsPath(fundingId)}/pending`),
  getPendingContributionItems: (fundingId: number) =>
    clientApi.get<PendingContributionItemListResponse>(`${contributionsPath(fundingId)}/pending`),
  // TODO(API): Swagger에 없는 구 엔드포인트. 일괄 처리·되돌리기 스펙이 나오면 confirm/reject/confirmAll로 교체한다
  updateContributionStatus: (fundingId: number, body: UpdateContributionStatusRequest) =>
    clientApi.patch<null>(`${contributionsPath(fundingId)}/status`, body),

  createContribution: (fundingId: number, body: CreateContributionRequest) =>
    clientApi.post<CreateContributionResponse>(contributionsPath(fundingId), body),
  createMessageContribution: (fundingId: number, body: CreateMessageContributionRequest) =>
    clientApi.post<MessageContributionResponse>(
      `${contributionsPath(fundingId)}/message-only`,
      body,
    ),
  markTransferSent: (fundingId: number, contributionId: number, body: MarkTransferSentRequest) =>
    clientApi.post<MarkTransferSentResponse>(
      `${contributionsPath(fundingId)}/${contributionId}/transfer-sent`,
      body,
    ),

  confirmContribution: (fundingId: number, contributionId: number) =>
    clientApi.post<ContributionDecisionResponse>(
      `${contributionsPath(fundingId)}/${contributionId}/confirm`,
    ),
  rejectContribution: (fundingId: number, contributionId: number) =>
    clientApi.post<ContributionDecisionResponse>(
      `${contributionsPath(fundingId)}/${contributionId}/reject`,
    ),
  confirmAllContributions: (fundingId: number) =>
    clientApi.post<ConfirmAllContributionsResponse>(`${contributionsPath(fundingId)}/confirm-all`),

  getMyContributions: (fundingId: number) =>
    clientApi.get<MyContributionListResponse>(`${contributionsPath(fundingId)}/me`),
  updateMyContribution: (
    fundingId: number,
    contributionId: number,
    body: UpdateMyContributionRequest,
  ) =>
    clientApi.patch<MyContributionResponse>(
      `${contributionsPath(fundingId)}/${contributionId}`,
      body,
    ),

  accessGuestContribution: (fundingId: number, body: AccessGuestContributionRequest) =>
    clientApi.post<GuestContributionResponse>(`${contributionsPath(fundingId)}/guest/access`, body),
  updateGuestContribution: (
    fundingId: number,
    accessToken: string,
    body: UpdateGuestContributionRequest,
  ) =>
    clientApi.patch<UpdatedGuestContributionResponse>(
      `${contributionsPath(fundingId)}/guest`,
      body,
      { headers: { [GUEST_TOKEN_HEADER]: accessToken } },
    ),
  deleteGuestContribution: (fundingId: number, accessToken: string) =>
    clientApi.delete<null>(`${contributionsPath(fundingId)}/guest`, {
      headers: { [GUEST_TOKEN_HEADER]: accessToken },
    }),

  sendThankCard: (
    fundingId: number,
    contributionId: number,
    body: SendContributionThankCardRequest,
  ) =>
    clientApi.post<ContributionThankCardResponse>(
      `${contributionsPath(fundingId)}/${contributionId}/thank-card`,
      body,
    ),
  getReceivedThankCard: (contributionId: number) =>
    clientApi.get<ThankCardResponse>(`/api/contributions/${contributionId}/thank-card`),
};
