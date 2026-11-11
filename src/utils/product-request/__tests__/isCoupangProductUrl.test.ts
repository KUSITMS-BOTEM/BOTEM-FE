import { isCoupangProductUrl } from "../isCoupangProductUrl";

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
