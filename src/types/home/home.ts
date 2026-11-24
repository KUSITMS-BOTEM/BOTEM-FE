export type HomeFundingCardType = "CLOSED_UNOPENED" | "IN_PROGRESS";

export type FundingType = "BIRTHDAY" | "SURPRISE";

// 서프라이즈 카드의 단계. 선물 준비 전(SUR-PG-007) / 선물 준비 완료(SUR-PG-008)
export type SurpriseStage = "IN_PROGRESS" | "GIFT_PREPARING" | "GIFT_PREPARED";

export type HomeFundingParticipantPreviewResponse = {
  participantName: string;
  profileImageUrl: string | null;
};

export type HomeFundingCardResponse = {
  fundingId: number;
  shareKey: string;
  cardType: HomeFundingCardType;
  fundingType: FundingType;
  productName: string;
  productImageUrl: string;
  targetAmount: number;
  participantCount: number;
  participantPreviews: HomeFundingParticipantPreviewResponse[];
  remainingDays: number | null;
  confirmedPercentage: number;
  pendingPercentage: number;
  pendingContributionCount: number;
  // 마감 전이지만 목표 달성·확인 대기 0건이라 지금 결과를 열 수 있는 생일 펀딩이면 true
  earlyOpenable: boolean;
  // 서프라이즈 카드 제목에 쓰는 받는 사람 이름. 생일 펀딩은 null
  recipientName: string | null;
  // 생일 펀딩은 null
  surpriseStage: SurpriseStage | null;
};

export type HomeFundingListResponse = {
  fundingCards: HomeFundingCardResponse[];
  activeFundingCount: number;
  canOpenFunding: boolean;
};

export type GiftVerificationBannerResponse = {
  visible: boolean;
  pendingCount: number;
};

export type GiftVerificationTargetResponse = {
  giftVerificationId: number;
  fundingId: number;
  productName: string;
  productImageUrl: string;
  fundingDeadline: string;
  participantCount: number;
  replacementProductName: string | null;
};

export type GiftVerificationTargetListResponse = {
  pendingCount: number;
  targets: GiftVerificationTargetResponse[];
};

export type SurpriseRevealCardResponse = {
  fundingId: number;
  productImageUrl: string;
  productName: string;
  organizerName: string;
  participantCount: number;
  revealAt: string;
};

export type SurpriseRevealCardListResponse = {
  cards: SurpriseRevealCardResponse[];
};

export type HomeNoFundingState = "WISH_RECOMMENDATION" | "EMPTY";

export type HomeWishCardResponse = {
  wishId: number;
  productName: string;
  productImageUrl: string;
  price: number;
  productUrl: string;
};

export type HomeWishPageResponse = {
  content: HomeWishCardResponse[];
  page: number;
  size: number;
  totalElements: number;
  hasNext: boolean;
};

export type HomeNoFundingResponse = {
  state: HomeNoFundingState;
  nickname: string;
  birthdayDday: number | null;
  wishes: HomeWishPageResponse;
};
