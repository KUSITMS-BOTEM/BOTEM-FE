import type { RecommendedProductResponse } from "@/types/recommended-product/recommendedProduct";

// 펀딩 진행 중이면 펀딩, 위시에 담았으면 위시 상세로 보내고, 둘 다 아니면 추천 상품 상세로 보낸다
export const getRecommendedProductHref = ({
  id,
  wishId,
  fundingId,
}: Pick<RecommendedProductResponse, "id" | "wishId" | "fundingId">) => {
  if (fundingId != null) return `/funding/${fundingId}`;
  if (wishId != null) return `/wish/${wishId}`;
  return `/wish/recommended/${id}`;
};
