import type { GiftVerificationTargetResponse } from "@/types/home/home";
import {
  formatGiftVerificationCaption,
  getReceivedProductName,
  sortByOldestDeadline,
} from "@/utils/home/giftVerificationTarget";

const makeTarget = (
  giftVerificationId: number,
  overrides: Partial<GiftVerificationTargetResponse> = {},
): GiftVerificationTargetResponse => ({
  giftVerificationId,
  fundingId: giftVerificationId,
  productName: `상품${giftVerificationId}`,
  productImageUrl: `/product-${giftVerificationId}.png`,
  fundingDeadline: "2026-10-13T23:59:59",
  participantCount: 6,
  replacementProductName: null,
  ...overrides,
});

describe("sortByOldestDeadline", () => {
  it("마감이 이른 순서로 정렬한다", () => {
    const late = makeTarget(1, { fundingDeadline: "2026-10-13T23:59:59" });
    const early = makeTarget(2, { fundingDeadline: "2026-09-30T23:59:59" });
    const middle = makeTarget(3, { fundingDeadline: "2026-10-05T23:59:59" });

    expect(sortByOldestDeadline([late, early, middle])).toEqual([early, middle, late]);
  });

  it("원본 배열의 순서를 바꾸지 않는다", () => {
    const late = makeTarget(1, { fundingDeadline: "2026-10-13T23:59:59" });
    const early = makeTarget(2, { fundingDeadline: "2026-09-30T23:59:59" });
    const original = [late, early];

    sortByOldestDeadline(original);

    expect(original).toEqual([late, early]);
  });
});

describe("formatGiftVerificationCaption", () => {
  it("'M월 D일 마감 · 친구 N명' 형식으로 만든다", () => {
    expect(
      formatGiftVerificationCaption({
        fundingDeadline: "2026-10-13T23:59:59",
        participantCount: 6,
      }),
    ).toBe("10월 13일 마감 · 친구 6명");
  });
});

describe("getReceivedProductName", () => {
  it("대체 상품명이 있으면 대체 상품명을 돌려준다", () => {
    expect(
      getReceivedProductName({ productName: "원래 상품", replacementProductName: "바꾼 상품" }),
    ).toBe("바꾼 상품");
  });

  it("대체 상품명이 null이면 원래 상품명을 돌려준다", () => {
    expect(getReceivedProductName({ productName: "원래 상품", replacementProductName: null })).toBe(
      "원래 상품",
    );
  });
});
