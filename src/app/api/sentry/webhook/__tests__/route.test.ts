import { createHmac } from "node:crypto";

import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { NextRequest } from "next/server";

import { POST } from "../route";

const SECRET = "test-secret";
const DISCORD_URL = "https://discord.test/hook";
const server = setupServer();

const alertBody = JSON.stringify({
  action: "triggered",
  data: { triggered_rule: "[BE] production 새 이슈", event: { title: "NullPointerException" } },
});

function makeRequest(
  body: string,
  { resource = "event_alert", signature }: { resource?: string; signature?: string } = {},
) {
  return new NextRequest("http://localhost/api/sentry/webhook", {
    method: "POST",
    body,
    headers: {
      "sentry-hook-resource": resource,
      "sentry-hook-signature": signature ?? createHmac("sha256", SECRET).update(body).digest("hex"),
    },
  });
}

// 핸들러가 없으면 onUnhandledFrame으로 실패하므로, 디스코드로 요청이 안 나가는 것도 함께 검증된다
beforeAll(() => server.listen({ onUnhandledFrame: "error" }));

beforeEach(() => {
  vi.stubEnv("SENTRY_WEBHOOK_SECRET", SECRET);
  vi.stubEnv("DISCORD_SENTRY_WEBHOOK_URL", DISCORD_URL);
});

afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});

afterAll(() => server.close());

describe("POST /api/sentry/webhook", () => {
  it("서명이 맞지 않으면 401을 반환하고 디스코드로 보내지 않는다", async () => {
    const res = await POST(makeRequest(alertBody, { signature: "invalid" }));

    expect(res.status).toBe(401);
  });

  it("알림이 아닌 웹훅(installation)은 디스코드로 보내지 않고 200을 반환한다", async () => {
    const res = await POST(makeRequest(alertBody, { resource: "installation" }));

    expect(res.status).toBe(200);
  });

  it("알림 웹훅이면 디스코드 형식으로 바꿔 한 번 보내고 200을 반환한다", async () => {
    const received: unknown[] = [];
    server.use(
      http.post(DISCORD_URL, async ({ request }) => {
        received.push(await request.json());
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const res = await POST(makeRequest(alertBody));

    expect(res.status).toBe(200);
    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({
      embeds: [{ title: "NullPointerException" }],
    });
  });

  it("디스코드 전송이 실패하면 502를 반환한다", async () => {
    server.use(http.post(DISCORD_URL, () => new HttpResponse(null, { status: 400 })));

    const res = await POST(makeRequest(alertBody));

    expect(res.status).toBe(502);
  });
});
