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
