import { clientApi } from "@/apis/client";
import type {
  RecommendedProductCategory,
  RecommendedProductResponse,
} from "@/types/recommended-product/recommendedProduct";

export const recommendedProductService = {
  getRecommendedProducts: (category?: RecommendedProductCategory) =>
    clientApi.get<RecommendedProductResponse[]>(
      "/api/recommended-products",
      category ? { category } : undefined,
    ),
  getRecommendedProduct: (productId: string) =>
    clientApi.get<RecommendedProductResponse>(`/api/recommended-products/${productId}`),
};
