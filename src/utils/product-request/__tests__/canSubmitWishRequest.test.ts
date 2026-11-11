import { canSubmitWishRequest } from "../canSubmitWishRequest";

describe("canSubmitWishRequest", () => {
  it("링크가 입력돼 있으면 true를 반환한다 (상품 이름은 선택)", () => {
    expect(canSubmitWishRequest({ productUrl: "https://www.coupang.com/vp/1" })).toBe(true);
  });

  it("링크 형식이 올바르지 않아도 입력만 있으면 true를 반환한다 (형식은 제출 시 검증)", () => {
    expect(canSubmitWishRequest({ productUrl: "coupang" })).toBe(true);
  });

  it("링크가 비어 있으면 false를 반환한다", () => {
    expect(canSubmitWishRequest({ productUrl: "" })).toBe(false);
  });

  it("링크가 공백뿐이면 false를 반환한다", () => {
    expect(canSubmitWishRequest({ productUrl: "   " })).toBe(false);
  });
});
