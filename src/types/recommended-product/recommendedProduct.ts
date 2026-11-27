export type RecommendedProductCategory =
  | "EARPHONE_HEADPHONE"
  | "SMART_DEVICE_GAME"
  | "HAIR_BEAUTY_DEVICE"
  | "SKINCARE"
  | "PERFUME"
  | "LIVING_APPLIANCE";

export type RecommendedProductStatus = "ON_SALE" | "DISCONTINUED";

export type RecommendedProductResponse = {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  sellerName: string;
  productUrl: string;
  category: RecommendedProductCategory;
  status: RecommendedProductStatus;
  wishId: number | null;
  fundingId: number | null;
};
