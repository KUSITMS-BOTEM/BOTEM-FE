import { clearMockAuthCookies, setMockAuthCookies } from "../mockAuthCookies";

describe("mockAuthCookies", () => {
  afterEach(() => {
    clearMockAuthCookies();
  });

  it("로그인 흉내 시 refreshToken·isLoggedIn 쿠키가 함께 설정된다", () => {
    setMockAuthCookies();

    expect(document.cookie).toContain("refreshToken=mock-refresh-token");
    expect(document.cookie).toContain("isLoggedIn=true");
  });

  it("로그아웃 흉내 시 설정된 두 쿠키가 모두 제거된다", () => {
    setMockAuthCookies();

    clearMockAuthCookies();

    expect(document.cookie).not.toContain("refreshToken");
    expect(document.cookie).not.toContain("isLoggedIn");
  });

  it("쿠키가 없는 상태에서 제거해도 에러 없이 빈 상태를 유지한다", () => {
    expect(() => clearMockAuthCookies()).not.toThrow();
    expect(document.cookie).toBe("");
  });
});
