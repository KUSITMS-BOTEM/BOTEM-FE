import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { wishService } from "@/apis/wish/wishService";
import { homeNoFundingQueryKey } from "@/hooks/queries/home/useHomeNoFundingQuery";
import { recommendedProductsQueryKey } from "@/hooks/queries/recommended-product/useRecommendedProductsQuery";
import { homeWishesQueryKey } from "@/hooks/queries/wish/useHomeWishesQuery";
import { wishesQueryKey } from "@/hooks/queries/wish/useWishesQuery";
import { useWishOriginStore } from "@/store/wishOriginStore";
import { useWishToastStore } from "@/store/wishToastStore";

export const useDeleteWishMutation = (wishId: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => wishService.deleteWish(wishId),
    // 캐시를 즉시 지우면 아직 마운트된 상세 페이지가 삭제된 위시를 재조회할 수 있다 — 페이지를 떠나면 gcTime에 따라 자동 정리된다
    onSuccess: () => {
      // 이동할 화면(추천 상품 목록·상세, 홈, 위시 목록)이 삭제 전 wishId를 들고 있지 않게 목록 키만 무효화한다
      queryClient.invalidateQueries({ queryKey: wishesQueryKey, exact: true });
      queryClient.invalidateQueries({ queryKey: homeWishesQueryKey });
      // 펀딩 없는 홈 응답에도 위시 목록이 들어 있어 함께 다시 받는다
      queryClient.invalidateQueries({ queryKey: homeNoFundingQueryKey });
      queryClient.invalidateQueries({ queryKey: recommendedProductsQueryKey });
      // 위시 응답엔 추천 상품 id가 없어 담을 때 기록해 둔 값을 쓴다
      const { recommendedProductIdByWishId, clearOrigin } = useWishOriginStore.getState();
      const productId = recommendedProductIdByWishId[wishId];
      clearOrigin(wishId);
      // 추천 상품 상세에서 담은 위시만 그 상세로 돌려보낸다. 그 외(목록 진입·새로고침)는 기존처럼 홈
      if (productId == null) return router.replace("/home");
      useWishToastStore.getState().mark("deleted");
      router.replace(`/wish/recommended/${productId}`);
    },
  });
};
