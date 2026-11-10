import { useQuery } from "@tanstack/react-query";

import { recommendedProductService } from "@/apis/recommendedProduct/recommendedProductService";
import type { RecommendedProductCategory } from "@/types/recommendedProduct/recommendedProduct";

export const useRecommendedProductsQuery = (category?: RecommendedProductCategory) =>
  useQuery({
    queryKey: ["recommendedProducts", category],
    queryFn: () => recommendedProductService.getRecommendedProducts(category),
  });
