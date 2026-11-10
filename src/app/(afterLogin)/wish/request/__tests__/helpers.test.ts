import { canSubmitWishRequest, isCoupangProductUrl } from "../helpers";

describe("canSubmitWishRequest", () => {
  it("링크와 상품 이름이 모두 입력돼 있으면 true를 반환한다", () => {
    expect(
      canSubmitWishRequest({ productUrl: "https://www.coupang.com/vp/1", productName: "에어팟" }),
    ).toBe(true);
  });

  it("링크 형식이 올바르지 않아도 입력만 있으면 true를 반환한다 (형식은 제출 시 검증)", () => {
    expect(canSubmitWishRequest({ productUrl: "coupang", productName: "에어팟" })).toBe(true);
  });

  it("링크가 비어 있으면 false를 반환한다", () => {
    expect(canSubmitWishRequest({ productUrl: "", productName: "에어팟" })).toBe(false);
  });

  it("링크가 공백뿐이면 false를 반환한다", () => {
    expect(canSubmitWishRequest({ productUrl: "   ", productName: "에어팟" })).toBe(false);
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

describe("isCoupangProductUrl", () => {
  it.each([
    "https://coupang.com/vp/products/1",
    "https://www.coupang.com/vp/products/1",
    "https://m.coupang.com/vm/products/1",
    "https://link.coupang.com/a/abc",
    "https://coupa.ng/abc",
  ])("허용 도메인 %s는 true를 반환한다", url => {
    expect(isCoupangProductUrl(url)).toBe(true);
  });

  it("앞뒤 공백은 무시하고 검사한다", () => {
    expect(isCoupangProductUrl("  https://www.coupang.com/vp/1  ")).toBe(true);
  });

  it("http 프로토콜이면 false를 반환한다", () => {
    expect(isCoupangProductUrl("http://www.coupang.com/vp/1")).toBe(false);
  });

  it("쿠팡 외 도메인이면 false를 반환한다", () => {
    expect(isCoupangProductUrl("https://www.naver.com")).toBe(false);
  });

  it.each(["https://evilcoupang.com", "https://coupang.com.evil.com", "https://shop.coupang.com"])(
    "허용 목록에 없는 유사·하위 도메인 %s는 false를 반환한다",
    url => {
      expect(isCoupangProductUrl(url)).toBe(false);
    },
  );

  it("URL 형식이 아니면 false를 반환한다", () => {
    expect(isCoupangProductUrl("coupang.com")).toBe(false);
    expect(isCoupangProductUrl("")).toBe(false);
  });
});
