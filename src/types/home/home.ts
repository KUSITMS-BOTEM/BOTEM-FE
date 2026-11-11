export type HomeFundingCardType = "CLOSED_UNOPENED" | "IN_PROGRESS";

export type FundingType = "BIRTHDAY" | "SURPRISE";

export type HomeFundingCardResponse = {
  fundingId: number;
  cardType: HomeFundingCardType;
  fundingType: FundingType;
  productName: string;
  productImageUrl: string;
  remainingDays: number | null;
  confirmedPercentage: number;
  pendingPercentage: number;
  pendingContributionCount: number;
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
