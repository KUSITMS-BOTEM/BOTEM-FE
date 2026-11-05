import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const BASE_URL = "http://backend.test";
const server = setupServer();

let serverApi: (typeof import("../server"))["serverApi"];
let ApiError: (typeof import("@/types/api"))["ApiError"];

beforeAll(async () => {
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", BASE_URL);
  server.listen({ onUnhandledFrame: "error" });
  ({ serverApi } = await import("../server"));
  ({ ApiError } = await import("@/types/api"));
});

afterEach(() => server.resetHandlers());

afterAll(() => {
  server.close();
  vi.unstubAllEnvs();
});

describe("serverApi.get", () => {
  it("성공 응답이면 data를 반환한다", async () => {
    server.use(
      http.get(`${BASE_URL}/seed-pools`, () =>
        HttpResponse.json({ success: true, data: { id: 1 }, error: null }),
      ),
    );

    await expect(serverApi.get("/seed-pools")).resolves.toEqual({ id: 1 });
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

    await expect(serverApi.get("/seed-pools")).rejects.toMatchObject(
      new ApiError("NOT_FOUND", "없음"),
    );
  });

  it("네트워크 에러면 ApiError(NETWORK_ERROR)로 변환한다", async () => {
    server.use(http.get(`${BASE_URL}/seed-pools`, () => HttpResponse.error()));

    await expect(serverApi.get("/seed-pools")).rejects.toMatchObject({ code: "NETWORK_ERROR" });
  });
});
