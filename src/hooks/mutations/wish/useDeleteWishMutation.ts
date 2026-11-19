import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { wishService } from "@/apis/wish/wishService";
import { recommendedProductsQueryKey } from "@/hooks/queries/recommended-product/useRecommendedProductsQuery";
import { homeWishesQueryKey } from "@/hooks/queries/wish/useHomeWishesQuery";
import { wishesQueryKey } from "@/hooks/queries/wish/useWishesQuery";
import { useWishDeletedToastStore } from "@/store/wishDeletedToastStore";
import { useWishOriginStore } from "@/store/wishOriginStore";

export const useDeleteWishMutation = (wishId: string, recommendedProductId?: number | null) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => wishService.deleteWish(wishId),
    // 캐시를 즉시 지우면 아직 마운트된 상세 페이지가 삭제된 위시를 재조회할 수 있다 — 페이지를 떠나면 gcTime에 따라 자동 정리된다
    onSuccess: () => {
      // 이동할 화면(추천 상품 목록·상세, 홈, 위시 목록)이 삭제 전 wishId를 들고 있지 않게 목록 키만 무효화한다
      queryClient.invalidateQueries({ queryKey: wishesQueryKey, exact: true });
      queryClient.invalidateQueries({ queryKey: homeWishesQueryKey });
      queryClient.invalidateQueries({ queryKey: recommendedProductsQueryKey });
      // 응답의 값을 우선하고, 없으면 담을 때 기록해 둔 값을 쓴다
      const productId =
        recommendedProductId ?? useWishOriginStore.getState().recommendedProductIdByWishId[wishId];
      // 추천 상품 상세에서 담은 위시만 그 상세로 돌려보낸다. 그 외(목록 진입·새로고침)는 기존처럼 홈
      if (productId == null) return router.replace("/home");
      useWishDeletedToastStore.getState().markDeleted();
      router.replace(`/wish/recommended/${productId}`);
    },
  });
};
