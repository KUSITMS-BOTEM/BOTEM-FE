import type { FriendWishResponse } from "@/types/friend/friend";
import { toFundingWish } from "@/utils/friend/toFundingWish";

const wish: FriendWishResponse = {
  wishId: 1,
  productName: "모자",
  productImageUrl: "https://example.com/hat.png",
  price: 429000,
};

describe("toFundingWish", () => {
  it("펀딩 열기에 필요한 id·상품명·이미지·가격만 남긴다", () => {
    expect(toFundingWish(wish)).toEqual({
      id: 1,
      productName: "모자",
      productImageUrl: "https://example.com/hat.png",
      price: 429000,
    });
  });

  it.each([null, "javascript:alert(1)"])("이미지 URL이 %s이면 이미지를 비운다", productImageUrl => {
    expect(toFundingWish({ ...wish, productImageUrl }).productImageUrl).toBeUndefined();
  });
});
