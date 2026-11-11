import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { recommendedProductService } from "@/apis/recommended-product/recommendedProductService";
import type { RecommendedProductCategory } from "@/types/recommended-product/recommendedProduct";

export const useRecommendedProductsQuery = (category?: RecommendedProductCategory) =>
  useQuery({
    queryKey: ["recommendedProducts", category],
    queryFn: () => recommendedProductService.getRecommendedProducts(category),
    // 카테고리 전환 시 그리드 전체가 스켈레톤으로 깜빡이지 않도록 이전 결과를 유지한 채 백그라운드로 갱신한다
    placeholderData: keepPreviousData,
  });
