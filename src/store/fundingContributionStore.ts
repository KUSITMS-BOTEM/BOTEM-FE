import { create } from "zustand";

import type { LetterWriteValues } from "@/widgets/letter-paper/LetterWriteSheet";

// 보태기 플로우(금액 → 편지 → 비밀번호)의 입력값. 비밀번호·음성이 담기므로 persist하지 않아 새로고침·브라우저 종료 시 사라진다
type FundingContributionState = {
  amount: number;
  letter: LetterWriteValues | null;
  password: string;
  setAmount: (amount: number) => void;
  setLetter: (letter: LetterWriteValues) => void;
  setPassword: (password: string) => void;
  reset: () => void;
};

const INITIAL_VALUES = { amount: 0, letter: null, password: "" };

export const useFundingContributionStore = create<FundingContributionState>(set => ({
  ...INITIAL_VALUES,
  setAmount: amount => set({ amount }),
  setLetter: letter => set({ letter }),
  setPassword: password => set({ password }),
  reset: () => set(INITIAL_VALUES),
}));
