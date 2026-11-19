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
};
