import { clientApi } from "@/apis/client";
import type {
  RecommendedProductCategory,
  RecommendedProductResponse,
} from "@/types/recommendedProduct/recommendedProduct";

export const recommendedProductService = {
  getRecommendedProducts: (category?: RecommendedProductCategory) =>
    clientApi.get<RecommendedProductResponse[]>(
      "/api/recommended-products",
      category ? { category } : undefined,
    ),
};
