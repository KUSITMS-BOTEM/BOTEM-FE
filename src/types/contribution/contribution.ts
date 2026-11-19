export type PendingContributionResponse = {
  contributionId: number;
  participantName: string;
  profileImageUrl: string | null;
  participatedAt: string;
};

export type PendingContributionListResponse = {
  pendingContributionCount: number;
  contributions: PendingContributionResponse[];
};

export type FundingProgressResponse = {
  confirmedPercentage: number;
  pendingPercentage: number;
  pendingContributionCount: number;
  targetReached: boolean;
};

export type ContributionDecisionStatus =
  | "AWAITING_TRANSFER"
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "MESSAGE_ONLY";

export type ContributionDecisionResponse = {
  contributionId: number;
  status: ContributionDecisionStatus;
  progress: FundingProgressResponse;
};

export type ConfirmAllContributionsResponse = {
  confirmedCount: number;
  progress: FundingProgressResponse;
};
