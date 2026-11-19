import { create } from "zustand";

export type WishToastKind = "added" | "deleted";

type WishToastState = {
  pending: WishToastKind | null;
  mark: (kind: WishToastKind) => void;
  consume: (kind: WishToastKind) => boolean;
};

// 위시 담기·삭제 직후 이동한 화면에서만 토스트를 띄우기 위한 일회성 플래그(새로고침·다른 경로 진입에선 비어 있다)
export const useWishToastStore = create<WishToastState>((set, get) => ({
  pending: null,
  mark: kind => set({ pending: kind }),
  consume: kind => {
    const matched = get().pending === kind;
    if (matched) set({ pending: null });
    return matched;
  },
}));
