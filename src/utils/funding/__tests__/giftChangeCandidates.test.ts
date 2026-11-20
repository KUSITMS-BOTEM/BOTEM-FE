import type { WishResponse } from "@/types/wish/wish";
import { findFundingWish, getChangeableWishes } from "@/utils/funding/giftChangeCandidates";

const wish = (overrides: Partial<WishResponse>): WishResponse => ({
  id: 1,
  productName: "상품",
  productImageUrl: "https://example.com/1.png",
  price: 100000,
  productUrl: "https://example.com/1",
  sellerName: null,
  status: "AVAILABLE",
  fundingId: null,
  ...overrides,
});

describe("findFundingWish", () => {
  it("이 펀딩에 걸려 있는 위시를 찾는다", () => {
    const wishes = [
      wish({ id: 1, status: "FUNDING", fundingId: 9 }),
      wish({ id: 2, status: "FUNDING", fundingId: 7 }),
    ];

    expect(findFundingWish(wishes, 7)?.id).toBe(2);
  });

  it("이 펀딩에 걸린 위시가 없으면 undefined를 돌려준다", () => {
    expect(findFundingWish([wish({ id: 1 })], 7)).toBeUndefined();
  });
});

describe("getChangeableWishes", () => {
  it("고를 수 있고 모인 금액 이하인 위시만 남긴다", () => {
    const wishes = [
      wish({ id: 1, price: 300000 }),
      wish({ id: 2, price: 301000 }),
      wish({ id: 3, price: 301001 }),
      wish({ id: 4, price: 10000, status: "FUNDING", fundingId: 9 }),
      wish({ id: 5, price: 10000, status: "DISCONTINUED" }),
    ];

    expect(getChangeableWishes(wishes, 301000, []).map(item => item.id)).toEqual([1, 2]);
  });

  it("제외할 위시 id(현재·기존 선물)는 뺀다", () => {
    const wishes = [wish({ id: 1 }), wish({ id: 2 }), wish({ id: 3 })];

    expect(getChangeableWishes(wishes, 301000, [1, 3]).map(item => item.id)).toEqual([2]);
  });

  it("위시가 없으면 빈 배열을 돌려준다", () => {
    expect(getChangeableWishes([], 301000, [])).toEqual([]);
  });
});
