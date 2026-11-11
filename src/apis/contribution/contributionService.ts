import { clientApi } from "@/apis/client";
import type {
  PendingContributionListResponse,
  UpdateContributionStatusRequest,
} from "@/types/contribution/contribution";

export const contributionService = {
  getPendingContributions: (fundingId: number) =>
    clientApi.get<PendingContributionListResponse>(
      `/api/fundings/${fundingId}/contributions/pending`,
    ),
  updateContributionStatus: (fundingId: number, body: UpdateContributionStatusRequest) =>
    clientApi.patch<null>(`/api/fundings/${fundingId}/contributions/status`, body),
};
