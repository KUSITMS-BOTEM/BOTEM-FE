import { create } from "zustand";

// 비회원이 '내 보탬 확인'에서 입력한 이름·비밀번호. 비밀번호가 담기므로 persist하지 않아 새로고침·브라우저 종료 시 사라진다
type GuestBotemState = {
  name: string | null;
  password: string | null;
  setIdentity: (name: string, password: string) => void;
  reset: () => void;
};

export const useGuestBotemStore = create<GuestBotemState>(set => ({
  name: null,
  password: null,
  setIdentity: (name, password) => set({ name, password }),
  reset: () => set({ name: null, password: null }),
}));
