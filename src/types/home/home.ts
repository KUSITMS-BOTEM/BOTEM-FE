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
  targetAmount: number;
  participantCount: number;
};

export type HomeFundingListResponse = {
  fundingCards: HomeFundingCardResponse[];
  activeFundingCount: number;
  canOpenFunding: boolean;
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
