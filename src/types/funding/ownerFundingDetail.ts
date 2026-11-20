import type { ContributionDecisionStatus } from "@/types/contribution/contribution";
import type { FundingType } from "@/types/home/home";

export type FundingManagementState =
  "NO_PARTICIPANTS" | "IN_PROGRESS" | "TARGET_REACHED" | "CLOSED";

export type FundingDetailProductResponse = {
  name: string;
  imageUrl: string;
  price: number;
  url: string;
};

export type OwnerFundingParticipantResponse = {
  contributionId: number;
  order: number;
  name: string;
  profileImageUrl: string | null;
  status: ContributionDecisionStatus;
  participatedAt: string;
  thankCardSent: boolean;
  thankCardSentAt: string | null;
};

export type FundingManagementActionsResponse = {
  canCloseEarly: boolean;
  canExtend: boolean;
  canChangeProduct: boolean;
  canReissueShareCard: boolean;
};

export type OwnerFundingDetailResponse = {
  fundingId: number;
  shareKey: string;
  type: FundingType;
  title: string | null;
  story: string | null;
  promise: string | null;
  product: FundingDetailProductResponse;
  productChanged: boolean;
  productChangedAt: string | null;
  targetAmount: number;
  deadline: string;
  revealAt: string | null;
  remainingDays: number | null;
  confirmedPercentage: number;
  pendingPercentage: number;
  pendingContributionCount: number;
  targetReached: boolean;
  extended: boolean;
  earlyClosedAt: string | null;
  giftPreparedAt: string | null;
  participantCount: number;
  participants: OwnerFundingParticipantResponse[];
  messageCount: number;
  managementState: FundingManagementState;
  actions: FundingManagementActionsResponse;
};
