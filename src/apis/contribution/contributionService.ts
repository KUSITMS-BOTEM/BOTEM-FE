import { clientApi } from "@/apis/client";
import type {
  AccessGuestContributionRequest,
  ContributionDecisionsResponse,
  ContributionThankCardResponse,
  CreateContributionRequest,
  CreateContributionResponse,
  CreateMessageContributionRequest,
  DecideContributionsRequest,
  GuestContributionResponse,
  MarkTransferSentRequest,
  MarkTransferSentResponse,
  MessageContributionResponse,
  MyContributionListResponse,
  MyContributionResponse,
  PendingContributionListResponse,
  SendContributionThankCardRequest,
  UndoContributionDecisionsRequest,
  UpdatedGuestContributionResponse,
  UpdateGuestContributionRequest,
  UpdateMyContributionRequest,
} from "@/types/contribution/contribution";
import type { ThankCardResponse } from "@/types/thank-card/thankCard";

const GUEST_TOKEN_HEADER = "X-Guest-Contribution-Token";

// 참여자는 공유 키로, 개설자는 펀딩 ID로 호출한다
const participantPath = (shareKey: string) => `/api/fundings/share/${shareKey}/contributions`;
const ownerPath = (fundingId: number) => `/api/fundings/${fundingId}/contributions`;

export const contributionService = {
  getPendingContributions: (fundingId: number) =>
    clientApi.get<PendingContributionListResponse>(`${ownerPath(fundingId)}/pending`),

  createContribution: (shareKey: string, body: CreateContributionRequest) =>
    clientApi.post<CreateContributionResponse>(participantPath(shareKey), body),
  createMessageContribution: (shareKey: string, body: CreateMessageContributionRequest) =>
    clientApi.post<MessageContributionResponse>(`${participantPath(shareKey)}/message-only`, body),
  markTransferSent: (shareKey: string, contributionId: number, body: MarkTransferSentRequest) =>
    clientApi.post<MarkTransferSentResponse>(
      `${participantPath(shareKey)}/${contributionId}/transfer-sent`,
      body,
    ),

  decideContributions: (fundingId: number, body: DecideContributionsRequest) =>
    clientApi.post<ContributionDecisionsResponse>(`${ownerPath(fundingId)}/decisions`, body),
  undoContributionDecisions: (fundingId: number, body: UndoContributionDecisionsRequest) =>
    clientApi.post<ContributionDecisionsResponse>(`${ownerPath(fundingId)}/decisions/undo`, body),

  getMyContributions: (shareKey: string) =>
    clientApi.get<MyContributionListResponse>(`${participantPath(shareKey)}/me`),
  updateMyContribution: (
    shareKey: string,
    contributionId: number,
    body: UpdateMyContributionRequest,
  ) =>
    clientApi.patch<MyContributionResponse>(`${participantPath(shareKey)}/${contributionId}`, body),

  accessGuestContribution: (shareKey: string, body: AccessGuestContributionRequest) =>
    clientApi.post<GuestContributionResponse>(`${participantPath(shareKey)}/guest/access`, body),
  updateGuestContribution: (
    shareKey: string,
    accessToken: string,
    body: UpdateGuestContributionRequest,
  ) =>
    clientApi.patch<UpdatedGuestContributionResponse>(`${participantPath(shareKey)}/guest`, body, {
      headers: { [GUEST_TOKEN_HEADER]: accessToken },
    }),
  deleteGuestContribution: (shareKey: string, accessToken: string) =>
    clientApi.delete<null>(`${participantPath(shareKey)}/guest`, {
      headers: { [GUEST_TOKEN_HEADER]: accessToken },
    }),

  sendThankCard: (
    fundingId: number,
    contributionId: number,
    body: SendContributionThankCardRequest,
  ) =>
    clientApi.post<ContributionThankCardResponse>(
      `${ownerPath(fundingId)}/${contributionId}/thank-card`,
      body,
    ),
  getReceivedThankCard: (contributionId: number) =>
    clientApi.get<ThankCardResponse>(`/api/contributions/${contributionId}/thank-card`),
};
