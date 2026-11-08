import { isValidUrl } from "@/utils/isValidUrl";

describe("isValidUrl", () => {
  it("https://로 시작하는 URL이면 true를 반환한다", () => {
    expect(isValidUrl("https://www.coupang.com")).toBe(true);
  });

  it("http://로 시작하는 URL이면 true를 반환한다", () => {
    expect(isValidUrl("http://www.coupang.com")).toBe(true);
  });

  it("프로토콜이 없는 문자열이면 false를 반환한다", () => {
    expect(isValidUrl("www.coupang.com")).toBe(false);
  });

  it("빈 문자열이면 false를 반환한다", () => {
    expect(isValidUrl("")).toBe(false);
  });

  it("http/https가 아닌 프로토콜이면 false를 반환한다", () => {
    expect(isValidUrl("ftp://example.com")).toBe(false);
  });

  it("URL 형식이 아닌 임의 문자열이면 false를 반환한다", () => {
    expect(isValidUrl("not a url")).toBe(false);
  });
});
