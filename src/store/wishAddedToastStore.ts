import { create } from "zustand";

type WishAddedToastState = {
  pending: boolean;
  markAdded: () => void;
  consume: () => boolean;
};

// 위시 담기 직후 /wish/[wishId]로 이동할 때만 토스트를 띄우기 위한 일회성 플래그(새로고침·다른 경로 진입에선 비어 있다)
export const useWishAddedToastStore = create<WishAddedToastState>((set, get) => ({
  pending: false,
  markAdded: () => set({ pending: true }),
  consume: () => {
    const { pending } = get();
    if (pending) set({ pending: false });
    return pending;
  },
}));
