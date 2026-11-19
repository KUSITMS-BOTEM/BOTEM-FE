import type { RecommendedProductResponse } from "@/types/recommended-product/recommendedProduct";

// 위시에 담았으면(펀딩 진행 중 포함) 위시 상세로, 아니면 추천 상품 상세로 보낸다. 펀딩 중 여부는 위시 상세가 status로 분기한다
export const getRecommendedProductHref = ({
  id,
  wishId,
}: Pick<RecommendedProductResponse, "id" | "wishId" | "fundingId">) => {
  if (wishId != null) return `/wish/${wishId}`;
  return `/wish/recommended/${id}`;
};
