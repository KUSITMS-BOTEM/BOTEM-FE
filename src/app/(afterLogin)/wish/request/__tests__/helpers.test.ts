import { canSubmitWishRequest } from "../helpers";

describe("canSubmitWishRequest", () => {
  it("유효한 링크와 상품 이름이 모두 있으면 true를 반환한다", () => {
    expect(
      canSubmitWishRequest({ productUrl: "https://www.coupang.com/vp/1", productName: "에어팟" }),
    ).toBe(true);
  });

  it("링크 형식이 올바르지 않으면 false를 반환한다", () => {
    expect(canSubmitWishRequest({ productUrl: "coupang", productName: "에어팟" })).toBe(false);
  });

  it("링크가 비어 있으면 false를 반환한다", () => {
    expect(canSubmitWishRequest({ productUrl: "", productName: "에어팟" })).toBe(false);
  });

  it("상품 이름이 비어 있으면 false를 반환한다", () => {
    expect(canSubmitWishRequest({ productUrl: "https://www.coupang.com", productName: "" })).toBe(
      false,
    );
  });

  it("상품 이름이 공백뿐이면 false를 반환한다", () => {
    expect(
      canSubmitWishRequest({ productUrl: "https://www.coupang.com", productName: "   " }),
    ).toBe(false);
  });
});
