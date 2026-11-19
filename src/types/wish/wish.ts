export type WishStatus = "AVAILABLE" | "FUNDING" | "DISCONTINUED";

export type WishResponse = {
  id: number;
  productName: string;
  productImageUrl: string;
  price: number;
  productUrl: string;
  sellerName: string;
  status: WishStatus;
  fundingId: number | null;
  // TODO: 백엔드 응답 확정 전 임시 선택 필드 — 위시를 만든 추천 상품 id(삭제 후 그 상세로 돌아갈 때 사용)
  recommendedProductId?: number | null;
};

export type WishPageResponse = {
  content: WishResponse[];
  page: number;
  size: number;
  totalElements: number;
  hasNext: boolean;
};

export type AddWishRequest = {
  recommendedProductId: number;
};
