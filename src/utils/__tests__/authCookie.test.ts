import { clearAuthCookies, setAuthCookies } from "../authCookie";

const clearAllCookies = () => {
  document.cookie.split(";").forEach(cookieStr => {
    const name = cookieStr.split("=")[0]?.trim();
    if (name) {
      document.cookie = `${name}=; path=/; max-age=0`;
    }
  });
};

beforeEach(() => {
  clearAllCookies();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("setAuthCookies", () => {
  it("accessToken 쿠키에 전달된 값과 max-age=3600(60분)을 설정한다", () => {
    const setSpy = vi.spyOn(document, "cookie", "set");

    setAuthCookies("access-value", "refresh-value");

    expect(
      setSpy.mock.calls.some(call => call[0] === "accessToken=access-value; path=/; max-age=3600"),
    ).toBe(true);
  });

  it("refreshToken 쿠키에 전달된 값과 max-age=604800(7일)을 설정한다", () => {
    const setSpy = vi.spyOn(document, "cookie", "set");

    setAuthCookies("access-value", "refresh-value");

    expect(
      setSpy.mock.calls.some(
        call => call[0] === "refreshToken=refresh-value; path=/; max-age=604800",
      ),
    ).toBe(true);
  });

  it("호출 후 document.cookie에서 accessToken, refreshToken 값을 모두 읽을 수 있다", () => {
    setAuthCookies("a1", "r1");

    expect(document.cookie).toContain("accessToken=a1");
    expect(document.cookie).toContain("refreshToken=r1");
  });

  it("accessToken에 빈 문자열을 전달해도 쿠키 설정 문자열에 반영된다", () => {
    const setSpy = vi.spyOn(document, "cookie", "set");

    setAuthCookies("", "refresh-value");

    expect(setSpy.mock.calls.some(call => call[0] === "accessToken=; path=/; max-age=3600")).toBe(
      true,
    );
  });

  it("다른 값으로 다시 호출하면 쿠키 값이 최신 값으로 교체된다", () => {
    setAuthCookies("first-access", "first-refresh");
    setAuthCookies("second-access", "second-refresh");

    expect(document.cookie).toContain("accessToken=second-access");
    expect(document.cookie).toContain("refreshToken=second-refresh");
    expect(document.cookie).not.toContain("first-access");
    expect(document.cookie).not.toContain("first-refresh");
  });
});

describe("clearAuthCookies", () => {
  it("accessToken 쿠키 값을 비우고 max-age=0으로 설정한다", () => {
    const setSpy = vi.spyOn(document, "cookie", "set");

    clearAuthCookies();

    expect(setSpy.mock.calls.some(call => call[0] === "accessToken=; path=/; max-age=0")).toBe(
      true,
    );
  });

  it("refreshToken 쿠키 값을 비우고 max-age=0으로 설정한다", () => {
    const setSpy = vi.spyOn(document, "cookie", "set");

    clearAuthCookies();

    expect(setSpy.mock.calls.some(call => call[0] === "refreshToken=; path=/; max-age=0")).toBe(
      true,
    );
  });

  it("호출 후 document.cookie에서 accessToken, refreshToken 값이 더 이상 조회되지 않는다", () => {
    setAuthCookies("a2", "r2");

    clearAuthCookies();

    expect(document.cookie).not.toContain("accessToken=");
    expect(document.cookie).not.toContain("refreshToken=");
  });

  it("쿠키가 설정되지 않은 초기 상태에서 호출해도 에러 없이 실행된다", () => {
    expect(() => clearAuthCookies()).not.toThrow();
  });
});
