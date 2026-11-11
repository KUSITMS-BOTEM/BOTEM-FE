export type RecommendedProductCategory =
  | "EARPHONE_HEADPHONE"
  | "SMART_DEVICE_GAME"
  | "HAIR_BEAUTY_DEVICE"
  | "SKINCARE_MAKEUP"
  | "PERFUME"
  | "TUMBLER_LIVING";

export type RecommendedProductStatus = "ON_SALE" | "DISCONTINUED";

export type RecommendedProductResponse = {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  sellerName: string;
  category: RecommendedProductCategory;
  status: RecommendedProductStatus;
};
