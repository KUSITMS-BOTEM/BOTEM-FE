import type { ContributionLifecycleStatus } from "@/types/contribution/contribution";
import type { FundingProduct } from "@/types/funding/fundingDetail";
import type { FundingType } from "@/types/home/home";

export type FundingManagementState =
  "NO_PARTICIPANTS" | "IN_PROGRESS" | "TARGET_REACHED" | "CLOSED";

export type FundingManagementParticipant = {
  contributionId: number;
  order: number;
  name: string;
  profileImageUrl: string | null;
  status: Exclude<ContributionLifecycleStatus, "CANCELLED">;
  participatedAt: string;
  thankCardSent: boolean;
  thankCardSentAt: string | null;
};

export type FundingManagementActions = {
  canCloseEarly: boolean;
  canExtend: boolean;
  canChangeProduct: boolean;
  canReissueShareCard: boolean;
};

export type FundingManagementResponse = {
  fundingId: number;
  type: FundingType;
  title: string | null;
  story: string | null;
  promise: string | null;
  product: FundingProduct;
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
  participants: FundingManagementParticipant[];
  messageCount: number;
  managementState: FundingManagementState;
  actions: FundingManagementActions;
};

export type CloseFundingResponse = {
  fundingId: number;
  type: FundingType;
  status: string;
  deadline: string;
  revealAt: string | null;
  earlyClosedAt: string;
};

export type ExtendFundingRequest = {
  // "YYYY-MM-DD"
  newDeadline: string;
};

export type ExtendFundingResponse = {
  fundingId: number;
  status: string;
  deadline: string;
  extensionCount: number;
  extendedAt: string;
};

export type ChangeFundingProductRequest = {
  wishId: number;
};

export type ChangeFundingProductResponse = {
  fundingId: number;
  product: FundingProduct;
  productChangedAt: string;
};
