import { formatWon, getRemainingAmount, getShortfall } from "@/utils/funding/giftChangeAmount";

describe("formatWon", () => {
  it.each([
    [301000, "301,000원"],
    [0, "0원"],
    [1000000, "1,000,000원"],
  ])("%i → %s", (amount, expected) => {
    expect(formatWon(amount)).toBe(expected);
  });
});

describe("getShortfall", () => {
  it.each([
    [329000, 301000, 28000],
    [301000, 301000, 0],
    [200000, 301000, 0],
  ])("가격 %i, 모인 금액 %i이면 부족 금액은 %i", (price, collected, expected) => {
    expect(getShortfall(price, collected)).toBe(expected);
  });
});

describe("getRemainingAmount", () => {
  it.each([
    [301000, 250000, 51000],
    [301000, 301000, 0],
  ])("모인 금액 %i, 가격 %i이면 남는 금액은 %i", (collected, price, expected) => {
    expect(getRemainingAmount(collected, price)).toBe(expected);
  });
});
