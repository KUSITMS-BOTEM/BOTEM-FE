import { useQuery } from "@tanstack/react-query";

import { recommendedProductService } from "@/apis/recommended-product/recommendedProductService";
import { ApiError } from "@/types/api";

export const useRecommendedProductQuery = (productId: string) =>
  useQuery({
    queryKey: ["recommendedProducts", productId],
    queryFn: () => recommendedProductService.getRecommendedProduct(productId),
    meta: { skipGlobalError: true },
    // PRODUCT_001(없음)·AUTH_*(인증 실패)는 페이지에서 리다이렉트로 즉시 처리하므로 재시도하지 않는다
    retry: (failureCount, error) => {
      if (
        error instanceof ApiError &&
        (error.code === "PRODUCT_001" || error.code.startsWith("AUTH_"))
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
