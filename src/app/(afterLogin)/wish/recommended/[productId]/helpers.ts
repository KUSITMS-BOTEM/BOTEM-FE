import { ApiError } from "@/types/api";

export type RecommendedProductErrorAction = "notFound" | "unauthorized" | "alert" | "none";

// PRODUCT_001: 추천 상품 없음, AUTH_*: 인증 실패(reissue 실패 포함)
export const resolveRecommendedProductErrorAction = (
  error: unknown,
): RecommendedProductErrorAction => {
  if (!(error instanceof ApiError)) return "none";
  if (error.code === "PRODUCT_001") return "notFound";
  if (error.code.startsWith("AUTH_")) return "unauthorized";
  return "alert";
};
