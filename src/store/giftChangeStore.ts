import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type OriginalGift = {
  wishId: number;
  productName: string;
  price: number;
  productImageUrl: string;
};

type GiftChangeState = {
  fundingId: number | null;
  // 서프라이즈 받는 사람이 바꾸는 중이면 /surprised 경로로 돌아가야 한다
  surprise: boolean;
  originalGift: OriginalGift | null;
  // "상품 보기"로 추천 상품에 다녀오는 중일 때만 true — 이때 담은 위시는 위시 상세 대신 위시 변경 화면으로 보낸다
  browsingProducts: boolean;
  start: (fundingId: number, originalGift: OriginalGift | null, surprise?: boolean) => void;
  setBrowsingProducts: (browsingProducts: boolean) => void;
  clear: () => void;
};

// 다른 선물 고르기 → 위시 추가 → 위시 변경으로 화면을 넘나드는 동안 어느 펀딩을 바꾸는 중인지 기억한다.
// 서버는 바꾸기 전 위시 id를 돌려주지 않아, 되돌리기·기존 선물 보기에 쓸 원래 선물도 여기 둔다(새로고침에도 남도록 sessionStorage)
export const useGiftChangeStore = create<GiftChangeState>()(
  persist(
    set => ({
      fundingId: null,
      surprise: false,
      originalGift: null,
      browsingProducts: false,
      start: (fundingId, originalGift, surprise = false) =>
        set({ fundingId, originalGift, surprise }),
      setBrowsingProducts: browsingProducts => set({ browsingProducts }),
      clear: () =>
        set({ fundingId: null, surprise: false, originalGift: null, browsingProducts: false }),
    }),
    { name: "botem-gift-change", storage: createJSONStorage(() => sessionStorage) },
  ),
);

export const giftChangeBasePath = (fundingId: number, surprise: boolean) =>
  surprise ? `/surprised/${fundingId}` : `/funding/${fundingId}`;
