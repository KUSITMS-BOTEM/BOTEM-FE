import { NextRequest, NextResponse } from "next/server";

import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const BACKEND_URL = "http://backend.test";
const server = setupServer();

let helpers: typeof import("../helpers");

beforeAll(async () => {
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", BACKEND_URL);
  server.listen({ onUnhandledFrame: "error" });
  helpers = await import("../helpers");
});

afterEach(() => server.resetHandlers());

afterAll(() => {
  server.close();
  vi.unstubAllEnvs();
});

describe("cookieHeaderFrom", () => {
  it("refreshToken 쿠키가 있으면 Cookie 헤더 문자열을 만든다", () => {
    const request = new NextRequest("http://localhost/api/auth/reissue", {
      headers: { cookie: "refreshToken=abc123" },
    });

    expect(helpers.cookieHeaderFrom(request)).toBe("refreshToken=abc123");
  });

  it("refreshToken 쿠키가 없으면 undefined를 반환한다", () => {
    const request = new NextRequest("http://localhost/api/auth/reissue");

    expect(helpers.cookieHeaderFrom(request)).toBeUndefined();
  });
});

describe("forwardRefreshCookie", () => {
  it("백엔드 Set-Cookie의 value·Max-Age를 로컬 쿠키로 재발급한다", () => {
    const backendRes = new Response(null, {
      headers: { "set-cookie": "refreshToken=abc123; Max-Age=604800; Path=/; HttpOnly" },
    });
    const response = NextResponse.json({});

    helpers.forwardRefreshCookie(response, backendRes);

    expect(response.cookies.get("refreshToken")?.value).toBe("abc123");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=604800");
  });

  it("대상 Set-Cookie가 없으면 쿠키를 설정하지 않는다", () => {
    const backendRes = new Response(null);
    const response = NextResponse.json({});

    helpers.forwardRefreshCookie(response, backendRes);

    expect(response.cookies.get("refreshToken")).toBeUndefined();
  });
});

describe("clearRefreshCookie", () => {
  it("refreshToken 쿠키를 제거한다", () => {
    const response = NextResponse.json({});
    response.cookies.set("refreshToken", "abc123");

    helpers.clearRefreshCookie(response);

    expect(response.cookies.get("refreshToken")?.value).toBe("");
  });
});

describe("forwardIsLoggedInCookie", () => {
  it("백엔드 Set-Cookie의 isLoggedIn 값을 로컬 쿠키로 재발급한다", () => {
    const backendRes = new Response(null, {
      headers: { "set-cookie": "isLoggedIn=true; Max-Age=604800; Path=/" },
    });
    const response = NextResponse.json({});

    helpers.forwardIsLoggedInCookie(response, backendRes);

    expect(response.cookies.get("isLoggedIn")?.value).toBe("true");
  });

  it("대상 Set-Cookie가 없으면 쿠키를 설정하지 않는다", () => {
    const backendRes = new Response(null);
    const response = NextResponse.json({});

    helpers.forwardIsLoggedInCookie(response, backendRes);

    expect(response.cookies.get("isLoggedIn")).toBeUndefined();
  });
});

describe("clearIsLoggedInCookie", () => {
  it("isLoggedIn 쿠키를 제거한다", () => {
    const response = NextResponse.json({});
    response.cookies.set("isLoggedIn", "true");

    helpers.clearIsLoggedInCookie(response);

    expect(response.cookies.get("isLoggedIn")?.value).toBe("");
  });
});

describe("relayToBackend", () => {
  it("운영 환경에서는 백엔드를 호출하지 않고 404를 반환한다", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const { response, backendRes } = await helpers.relayToBackend("/api/auth/reissue", {
      method: "POST",
    });

    expect(response.status).toBe(404);
    expect(backendRes).toBeNull();
    await expect(response.json()).resolves.toMatchObject({ error: { code: "NOT_FOUND" } });

    vi.stubEnv("NODE_ENV", "test");
  });

  it("개발 환경에서는 백엔드로 중계하고 응답을 그대로 전달한다", async () => {
    vi.stubEnv("NODE_ENV", "development");
    server.use(
      http.post(`${BACKEND_URL}/api/auth/reissue`, () =>
        HttpResponse.json({ success: true, data: { accessToken: "new-token" }, error: null }),
      ),
    );

    const { response, backendRes } = await helpers.relayToBackend("/api/auth/reissue", {
      method: "POST",
    });

    expect(backendRes).not.toBeNull();
    await expect(response.json()).resolves.toMatchObject({ data: { accessToken: "new-token" } });

    vi.stubEnv("NODE_ENV", "test");
  });

  it("백엔드 호출이 실패하면 502와 BFF_RELAY_FAILED를 반환한다", async () => {
    vi.stubEnv("NODE_ENV", "development");
    server.use(http.post(`${BACKEND_URL}/api/auth/reissue`, () => HttpResponse.error()));

    const { response, backendRes } = await helpers.relayToBackend("/api/auth/reissue", {
      method: "POST",
    });

    expect(response.status).toBe(502);
    expect(backendRes).toBeNull();
    await expect(response.json()).resolves.toMatchObject({ error: { code: "BFF_RELAY_FAILED" } });

    vi.stubEnv("NODE_ENV", "test");
  });
});
