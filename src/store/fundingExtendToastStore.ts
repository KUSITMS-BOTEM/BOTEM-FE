import { create } from "zustand";

type FundingExtendToastState = {
  pending: boolean;
  mark: () => void;
  consume: () => boolean;
};

// 결과 화면에서 연장한 직후 이동한 펀딩 상세에서만 토스트를 띄우기 위한 일회성 플래그(새로고침·다른 경로 진입에선 비어 있다)
export const useFundingExtendToastStore = create<FundingExtendToastState>((set, get) => ({
  pending: false,
  mark: () => set({ pending: true }),
  consume: () => {
    const matched = get().pending;
    if (matched) set({ pending: false });
    return matched;
  },
}));
