import { create } from "zustand";

// 비회원이 '내 보탬 확인'에서 입력한 이름·비밀번호. 비밀번호가 담기므로 persist하지 않아 새로고침·브라우저 종료 시 사라진다
// fundingId로 어느 펀딩에서 확인한 값인지 구분해, 다른 펀딩 화면에서는 확인된 상태로 보이지 않게 한다
type GuestBotemState = {
  fundingId: string | null;
  name: string | null;
  password: string | null;
  setIdentity: (fundingId: string, name: string, password: string) => void;
  reset: () => void;
};

export const useGuestBotemStore = create<GuestBotemState>(set => ({
  fundingId: null,
  name: null,
  password: null,
  setIdentity: (fundingId, name, password) => set({ fundingId, name, password }),
  reset: () => set({ fundingId: null, name: null, password: null }),
}));
