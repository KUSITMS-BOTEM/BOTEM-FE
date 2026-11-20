export type FundingResultContributionStatus =
  | "AWAITING_TRANSFER"
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "MESSAGE_ONLY";

export type FundingResultContributionResponse = {
  contributionId: number;
  name: string;
  profileImageUrl: string | null;
  status: FundingResultContributionStatus;
  participatedAt: string;
  hasMessage: boolean;
  hasPhoto: boolean;
  hasVoice: boolean;
  thankCardSent: boolean;
};

// GET /result와 POST /result/open이 같은 형태로 응답한다
export type FundingResultResponse = {
  fundingId: number;
  productName: string;
  productImageUrl: string;
  targetAmount: number;
  confirmedAmount: number;
  achievementPercentage: number;
  targetReached: boolean;
  participantCount: number;
  messageCount: number;
  pendingContributionCount: number;
  pendingCleanupRequired: boolean;
  // null이면 아직 팡을 열지 않은 상태
  resultOpenedAt: string | null;
  contributions: FundingResultContributionResponse[];
};
