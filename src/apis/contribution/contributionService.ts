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

const contributionsPath = (fundingId: number) => `/api/fundings/${fundingId}/contributions`;

export const contributionService = {
  getPendingContributions: (fundingId: number) =>
    clientApi.get<PendingContributionListResponse>(`${contributionsPath(fundingId)}/pending`),

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

  decideContributions: (fundingId: number, body: DecideContributionsRequest) =>
    clientApi.post<ContributionDecisionsResponse>(
      `${contributionsPath(fundingId)}/decisions`,
      body,
    ),
  undoContributionDecisions: (fundingId: number, body: UndoContributionDecisionsRequest) =>
    clientApi.post<ContributionDecisionsResponse>(
      `${contributionsPath(fundingId)}/decisions/undo`,
      body,
    ),

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
