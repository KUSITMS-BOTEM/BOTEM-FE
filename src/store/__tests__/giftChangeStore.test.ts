import { useGiftChangeStore } from "@/store/giftChangeStore";

const originalGift = {
  wishId: 2,
  productName: "다이슨 에어랩",
  price: 659000,
  productImageUrl: "https://example.com/2.png",
};

beforeEach(() => {
  useGiftChangeStore.getState().clear();
  sessionStorage.clear();
});

describe("useGiftChangeStore", () => {
  it("start로 바꾸는 중인 펀딩과 기존 선물을 기록한다", () => {
    useGiftChangeStore.getState().start(7, originalGift);

    expect(useGiftChangeStore.getState()).toMatchObject({ fundingId: 7, originalGift });
  });

  it("새로고침에도 남도록 sessionStorage에 저장한다", () => {
    useGiftChangeStore.getState().start(7, originalGift);

    expect(sessionStorage.getItem("botem-gift-change")).toContain('"fundingId":7');
  });

  it("clear하면 펀딩·기존 선물·상품 보기 상태를 모두 비운다", () => {
    useGiftChangeStore.getState().start(7, originalGift);
    useGiftChangeStore.getState().setBrowsingProducts(true);

    useGiftChangeStore.getState().clear();

    expect(useGiftChangeStore.getState()).toMatchObject({
      fundingId: null,
      originalGift: null,
      browsingProducts: false,
    });
  });
});
