import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const BASE_URL = "http://backend.test";
const server = setupServer();

// base64url(JSON) 조립 — 서명은 없어도 되는 순수 exp 클레임 디코딩 테스트용
function makeJwt(exp: number) {
  const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url");
  return `header.${payload}.signature`;
}

const EXPIRED_TOKEN = makeJwt(Math.floor(Date.now() / 1000) - 60);
const VALID_TOKEN = makeJwt(Math.floor(Date.now() / 1000) + 3600);

let clientApi: (typeof import("../client"))["clientApi"];
let useAuthStore: (typeof import("@/store/authStore"))["useAuthStore"];

beforeAll(async () => {
  // getAuthUrl이 production 분기에서만 절대 URL(BASE_URL)을 쓰므로, 테스트는 운영 경로로 고정해 검증한다.
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", BASE_URL);
  vi.stubEnv("NODE_ENV", "production");
  server.listen({ onUnhandledRequest: "error" });
  ({ clientApi } = await import("../client"));
  ({ useAuthStore } = await import("@/store/authStore"));
});

afterEach(() => {
  server.resetHandlers();
  useAuthStore.getState().clearAccessToken();
});

afterAll(() => {
  server.close();
  vi.unstubAllEnvs();
});

describe("clientApi", () => {
  it("성공 응답이면 data를 반환한다", async () => {
    server.use(
      http.get(`${BASE_URL}/seed-pools`, () =>
        HttpResponse.json({ success: true, data: { id: 1 }, error: null }),
      ),
    );

    await expect(clientApi.get("/seed-pools")).resolves.toEqual({ id: 1 });
  });

  it("success:false 응답이면 ApiError를 던진다", async () => {
    server.use(
      http.get(`${BASE_URL}/seed-pools`, () =>
        HttpResponse.json({
          success: false,
          data: null,
          error: { code: "NOT_FOUND", message: "없음" },
        }),
      ),
    );

    await expect(clientApi.get("/seed-pools")).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("네트워크 에러면 ApiError(NETWORK_ERROR)로 변환한다", async () => {
    server.use(http.get(`${BASE_URL}/seed-pools`, () => HttpResponse.error()));

    await expect(clientApi.get("/seed-pools")).rejects.toMatchObject({ code: "NETWORK_ERROR" });
  });

  it("accessToken이 만료 상태면 요청 전 선제적으로 재발급하고 새 토큰을 헤더에 싣는다", async () => {
    useAuthStore.getState().setAccessToken(EXPIRED_TOKEN);
    let receivedAuth: string | null = null;

    server.use(
      http.post(`${BASE_URL}/api/auth/reissue`, () =>
        HttpResponse.json({ success: true, data: { accessToken: VALID_TOKEN }, error: null }),
      ),
      http.get(`${BASE_URL}/seed-pools`, ({ request }) => {
        receivedAuth = request.headers.get("authorization");
        return HttpResponse.json({ success: true, data: null, error: null });
      }),
    );

    await clientApi.get("/seed-pools");

    expect(receivedAuth).toBe(`Bearer ${VALID_TOKEN}`);
    expect(useAuthStore.getState().accessToken).toBe(VALID_TOKEN);
  });

  it("401 응답을 받으면 재발급 후 원요청을 새 토큰으로 재시도한다", async () => {
    useAuthStore.getState().setAccessToken(VALID_TOKEN);
    let callCount = 0;

    server.use(
      http.post(`${BASE_URL}/api/auth/reissue`, () =>
        HttpResponse.json({ success: true, data: { accessToken: "refreshed-token" }, error: null }),
      ),
      http.get(`${BASE_URL}/seed-pools`, ({ request }) => {
        callCount += 1;
        if (callCount === 1) return new HttpResponse(null, { status: 401 });

        expect(request.headers.get("authorization")).toBe("Bearer refreshed-token");
        return HttpResponse.json({ success: true, data: { id: 2 }, error: null });
      }),
    );

    await expect(clientApi.get("/seed-pools")).resolves.toEqual({ id: 2 });
    expect(callCount).toBe(2);
  });

  it("401 이후 재발급도 실패하면 AUTH_EXPIRED로 통일되고 accessToken이 지워진다", async () => {
    useAuthStore.getState().setAccessToken(VALID_TOKEN);

    server.use(
      http.post(`${BASE_URL}/api/auth/reissue`, () =>
        HttpResponse.json({
          success: false,
          data: null,
          error: { code: "REISSUE_FAILED", message: "실패" },
        }),
      ),
      http.get(`${BASE_URL}/seed-pools`, () => new HttpResponse(null, { status: 401 })),
    );

    await expect(clientApi.get("/seed-pools")).rejects.toMatchObject({ code: "AUTH_EXPIRED" });
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it("만료된 토큰으로 선제 재발급 자체가 실패해도 AUTH_EXPIRED로 통일되고 accessToken이 지워진다", async () => {
    useAuthStore.getState().setAccessToken(EXPIRED_TOKEN);

    server.use(
      http.post(`${BASE_URL}/api/auth/reissue`, () =>
        HttpResponse.json({
          success: false,
          data: null,
          error: { code: "REISSUE_FAILED", message: "실패" },
        }),
      ),
    );

    await expect(clientApi.get("/seed-pools")).rejects.toMatchObject({ code: "AUTH_EXPIRED" });
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
