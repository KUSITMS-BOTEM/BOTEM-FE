import { create } from "zustand";

type WishDeletedToastState = {
  pending: boolean;
  markDeleted: () => void;
  consume: () => boolean;
};

// 위시 삭제 직후 추천 상품 상세로 이동할 때만 토스트를 띄우기 위한 일회성 플래그(새로고침·다른 경로 진입에선 비어 있다)
export const useWishDeletedToastStore = create<WishDeletedToastState>((set, get) => ({
  pending: false,
  markDeleted: () => set({ pending: true }),
  consume: () => {
    const { pending } = get();
    if (pending) set({ pending: false });
    return pending;
  },
}));
