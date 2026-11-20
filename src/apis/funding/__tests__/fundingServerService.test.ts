import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const BASE_URL = "http://backend.test";
const server = setupServer();

let fundingServerService: (typeof import("../fundingServerService"))["fundingServerService"];
let ApiError: (typeof import("@/types/api"))["ApiError"];

beforeAll(async () => {
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", BASE_URL);
  server.listen({ onUnhandledFrame: "error" });
  ({ fundingServerService } = await import("../fundingServerService"));
  ({ ApiError } = await import("@/types/api"));
});

afterEach(() => server.resetHandlers());

afterAll(() => {
  server.close();
  vi.unstubAllEnvs();
});

describe("fundingServerService.getFundingDetail", () => {
  it("공유 키 경로를 토큰 없이 호출하고 data를 반환한다", async () => {
    let authorization: string | null = "unset";
    server.use(
      http.get(`${BASE_URL}/api/fundings/share/share-key-12`, ({ request }) => {
        authorization = request.headers.get("Authorization");
        return HttpResponse.json({ success: true, data: { fundingId: 12 }, error: null });
      }),
    );

    await expect(fundingServerService.getFundingDetail("share-key-12")).resolves.toEqual({
      fundingId: 12,
    });
    expect(authorization).toBeNull();
  });

  it("없는 펀딩이면 서버 에러 코드를 담은 ApiError로 reject한다", async () => {
    server.use(
      http.get(`${BASE_URL}/api/fundings/share/share-key-404`, () =>
        HttpResponse.json(
          {
            success: false,
            data: null,
            error: { code: "FUNDING_002", message: "펀딩을 찾을 수 없습니다.", detail: null },
          },
          { status: 404 },
        ),
      ),
    );

    const error = await fundingServerService.getFundingDetail("share-key-404").catch(e => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("FUNDING_002");
  });
});
