import { parseSetCookieValue } from "../parseSetCookieValue";

describe("parseSetCookieValue", () => {
  it("쿠키 값을 추출한다", () => {
    const setCookies = ["refreshToken=abc123; Path=/; HttpOnly"];

    expect(parseSetCookieValue(setCookies, "refreshToken")).toEqual({ value: "abc123" });
  });

  it("Max-Age 속성도 함께 추출한다", () => {
    const setCookies = ["refreshToken=abc123; Max-Age=604800; Path=/; HttpOnly"];

    expect(parseSetCookieValue(setCookies, "refreshToken")).toEqual({
      value: "abc123",
      maxAge: 604800,
    });
  });

  it("대상 쿠키가 없으면 null을 반환한다", () => {
    const setCookies = ["otherCookie=xyz; Path=/"];

    expect(parseSetCookieValue(setCookies, "refreshToken")).toBeNull();
  });
});
