import { create } from "zustand";

type FriendsEntryState = {
  slideIn: boolean;
  setSlideIn: (slideIn: boolean) => void;
};

// 마이 메뉴에서 들어올 때만 친구 목록이 밀려 들어온다 — 친구 프로필에서 뒤로 돌아올 때는 다시 밀려 들어오지 않게 진입 직후 끈다
export const useFriendsEntryStore = create<FriendsEntryState>(set => ({
  slideIn: false,
  setSlideIn: slideIn => set({ slideIn }),
}));
