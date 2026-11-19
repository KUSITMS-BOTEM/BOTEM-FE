import type { RecommendedProductCategory } from "@/types/recommended-product/recommendedProduct";

export const RECOMMENDED_PRODUCT_CATEGORIES: {
  value: RecommendedProductCategory;
  label: string;
}[] = [
  { value: "EARPHONE_HEADPHONE", label: "이어폰·헤드폰" },
  { value: "SMART_DEVICE_GAME", label: "스마트기기·게임" },
  { value: "HAIR_BEAUTY_DEVICE", label: "헤어·뷰티 기기" },
  { value: "SKINCARE", label: "스킨케어" },
  { value: "PERFUME", label: "향수" },
  { value: "LIVING_APPLIANCE", label: "리빙·가전" },
];
