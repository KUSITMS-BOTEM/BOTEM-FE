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
  category: RecommendedProductCategory;
  status: RecommendedProductStatus;
  // TODO(백엔드 확정 시 정리): 내가 위시에 담은 상품이면 wishId, 펀딩 진행 중이면 fundingId를 내려주기로 구두 합의했다.
  // 아직 응답 구조가 확정되지 않아 선택 필드로 두었다. 확정되면 이름·nullable 여부를 맞출 것.
  wishId?: number | null;
  fundingId?: number | null;
};
