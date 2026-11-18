export type FundingRevealResponse = {
  contributorNames: string[];
  totalAmount: number;
  goalAchieved: boolean;
};

// 펀딩 열기 흐름이 쓰는 상품 정보. 내 위시(WishResponse)와 친구 위시를 모두 받을 수 있게 필요한 필드만 둔다
export type FundingWish = {
  productName: string;
  productImageUrl?: string;
  price: number;
};
