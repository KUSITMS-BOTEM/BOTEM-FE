import { clientApi } from "@/apis/client";
import type {
  ConfirmAllContributionsResponse,
  ContributionDecisionResponse,
  PendingContributionListResponse,
} from "@/types/contribution/contribution";

export const contributionService = {
  getPendingContributions: (fundingId: number) =>
    clientApi.get<PendingContributionListResponse>(
      `/api/fundings/${fundingId}/contributions/pending`,
    ),
  confirmContribution: (fundingId: number, contributionId: number) =>
    clientApi.post<ContributionDecisionResponse>(
      `/api/fundings/${fundingId}/contributions/${contributionId}/confirm`,
    ),
  rejectContribution: (fundingId: number, contributionId: number) =>
    clientApi.post<ContributionDecisionResponse>(
      `/api/fundings/${fundingId}/contributions/${contributionId}/reject`,
    ),
  confirmAllContributions: (fundingId: number) =>
    clientApi.post<ConfirmAllContributionsResponse>(
      `/api/fundings/${fundingId}/contributions/confirm-all`,
    ),
};
