import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import { customFetch } from "../orvalFetch";

const BASE_URL = "http://backend.test";
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

type FetchResult<T> = { status: number; data: T; headers: Headers };

describe("customFetch", () => {
  it("Content-Type이 application/json이면 data에 파싱된 JSON과 status·headers를 함께 반환한다", async () => {
    server.use(http.get(`${BASE_URL}/seed-pools`, () => HttpResponse.json({ id: 1 })));

    const result = await customFetch<FetchResult<{ id: number }>>(`${BASE_URL}/seed-pools`);

    expect(result.status).toBe(200);
    expect(result.data).toEqual({ id: 1 });
    expect(result.headers.get("content-type")).toContain("application/json");
  });

  it.each([204, 205, 304])("%d 응답이면 본문을 읽지 않고 data가 undefined다", async status => {
    server.use(http.get(`${BASE_URL}/seed-pools`, () => new HttpResponse(null, { status })));

    const result = await customFetch<FetchResult<unknown>>(`${BASE_URL}/seed-pools`);

    expect(result.status).toBe(status);
    expect(result.data).toBeUndefined();
  });

  it("Content-Type에 json이 없으면 data에 raw text가 그대로 담긴다", async () => {
    server.use(
      http.get(
        `${BASE_URL}/seed-pools`,
        () => new HttpResponse("plain text body", { headers: { "content-type": "text/plain" } }),
      ),
    );

    const result = await customFetch<FetchResult<string>>(`${BASE_URL}/seed-pools`);

    expect(result.data).toBe("plain text body");
  });
});
