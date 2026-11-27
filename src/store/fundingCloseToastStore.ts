import { create } from "zustand";

type FundingCloseToastState = {
  pending: boolean;
  mark: () => void;
  consume: () => void;
};

// 빈 펀딩을 마감한 직후 이동한 홈에서만 토스트를 띄우기 위한 일회성 플래그
export const useFundingCloseToastStore = create<FundingCloseToastState>(set => ({
  pending: false,
  mark: () => set({ pending: true }),
  consume: () => set({ pending: false }),
}));
