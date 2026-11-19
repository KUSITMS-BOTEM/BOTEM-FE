import { create } from "zustand";

type WishOriginState = {
  recommendedProductIdByWishId: Record<string, number>;
  setOrigin: (wishId: string, recommendedProductId: number) => void;
};

// 추천 상품 상세에서 담은 위시만 기록한다 — 위시 응답엔 추천 상품 id가 없어 삭제 후 되돌아갈 곳을 여기서 찾는다(새로고침하면 비어 /home으로 간다)
export const useWishOriginStore = create<WishOriginState>(set => ({
  recommendedProductIdByWishId: {},
  setOrigin: (wishId, recommendedProductId) =>
    set(state => ({
      recommendedProductIdByWishId: {
        ...state.recommendedProductIdByWishId,
        [wishId]: recommendedProductId,
      },
    })),
}));
