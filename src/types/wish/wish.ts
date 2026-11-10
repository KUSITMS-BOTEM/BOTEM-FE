export type WishStatus = "AVAILABLE" | "FUNDING" | "DISCONTINUED";

export type WishResponse = {
  id: number;
  productName: string;
  productImageUrl: string;
  price: number;
  productUrl: string;
  status: WishStatus;
  fundingId: number | null;
};
