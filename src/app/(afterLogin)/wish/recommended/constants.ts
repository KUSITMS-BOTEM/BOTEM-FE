import { RECOMMENDED_PRODUCT_CATEGORIES } from "@/constants/recommendedProductCategory";

export const ALL_CATEGORY_VALUE = "ALL";

export const CATEGORY_CHIPS = [
  { value: ALL_CATEGORY_VALUE, label: "전체" },
  ...RECOMMENDED_PRODUCT_CATEGORIES,
];
