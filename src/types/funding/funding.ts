import type { BankCode } from "@/constants/bank";
import type { FundingType } from "@/types/home/home";

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

// 펀딩 열기 흐름이 쓰는 상품 정보. 내 위시(WishResponse)와 친구 위시를 모두 받을 수 있게 필요한 필드만 둔다
export type FundingWish = {
  id: number;
  productName: string;
  productImageUrl?: string;
  price: number;
};

export type CreateFundingRequest = {
  wishId: number;
  bank: BankCode;
  accountNumber: string;
  targetAmount: number;
  // "YYYY-MM-DD"
  deadline: string;
  story: string;
  promise?: string;
};

export type CreateFundingResponse = {
  fundingId: number;
  type: FundingType;
  status: string;
  shareUrl: string;
};

export type FundingManagementState =
  "NO_PARTICIPANTS" | "IN_PROGRESS" | "TARGET_REACHED" | "CLOSED";

export type FundingManagementParticipantResponse = {
  contributionId: number;
  order: number;
  name: string;
  profileImageUrl: string | null;
  status: FundingResultContributionStatus;
  participatedAt: string;
  thankCardSent: boolean;
  thankCardSentAt: string | null;
};

// GET /api/fundings/{fundingId}/management (개설자용 관리 상세)
export type FundingManagementResponse = {
  fundingId: number;
  type: FundingType;
  title: string | null;
  story: string | null;
  promise: string | null;
  product: {
    name: string;
    imageUrl: string;
    price: number;
    url: string;
  };
  productChanged: boolean;
  productChangedAt: string | null;
  targetAmount: number;
  deadline: string;
  revealAt: string | null;
  // 마감 후에는 null
  remainingDays: number | null;
  confirmedPercentage: number;
  pendingPercentage: number;
  pendingContributionCount: number;
  targetReached: boolean;
  extended: boolean;
  earlyClosedAt: string | null;
  giftPreparedAt: string | null;
  participantCount: number;
  participants: FundingManagementParticipantResponse[];
  messageCount: number;
  managementState: FundingManagementState;
  actions: {
    canCloseEarly: boolean;
    canExtend: boolean;
    canChangeProduct: boolean;
    canReissueShareCard: boolean;
  };
};
