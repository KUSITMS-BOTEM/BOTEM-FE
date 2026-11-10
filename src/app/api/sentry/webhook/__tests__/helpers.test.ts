import { createHmac } from "node:crypto";

import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import { sendToDiscord, toDiscordMessage, verifySentrySignature } from "../helpers";

const SECRET = "test-secret";
const sign = (body: string, secret = SECRET) =>
  createHmac("sha256", secret).update(body, "utf8").digest("hex");

describe("verifySentrySignature", () => {
  const body = JSON.stringify({ action: "triggered", data: {} });

  it("시크릿으로 만든 서명이 맞으면 true", () => {
    expect(verifySentrySignature(body, sign(body), SECRET)).toBe(true);
  });

  it("원문의 공백이 달라도 재직렬화한 본문 기준 서명이 맞으면 true", () => {
    const spaced = '{ "action": "triggered", "data": {} }';
    expect(verifySentrySignature(spaced, sign(body), SECRET)).toBe(true);
  });

  it("본문이 변조되면 false", () => {
    expect(verifySentrySignature(`${body} `, sign("다른 본문"), SECRET)).toBe(false);
  });

  it("다른 시크릿으로 만든 서명이면 false", () => {
    expect(verifySentrySignature(body, sign(body, "wrong"), SECRET)).toBe(false);
  });

  it("서명 헤더나 시크릿이 없으면 false", () => {
    expect(verifySentrySignature(body, null, SECRET)).toBe(false);
    expect(verifySentrySignature(body, sign(body), undefined)).toBe(false);
  });
});

describe("toDiscordMessage", () => {
  const payload = {
    data: {
      triggered_rule: "[FE] production 새 이슈",
      event: {
        title: "TypeError: x is undefined",
        web_url: "https://botem-gc.sentry.io/issues/1/",
        environment: "production",
        level: "error",
        culprit: "app/page.tsx",
        user: { ip_address: "1.2.3.4" },
        request: { headers: [["Cookie", "refreshToken=secret"]] },
      },
    },
  };

  it("제목·링크·규칙·환경·레벨·위치를 embed에 담는다", () => {
    const [embed] = toDiscordMessage(payload).embeds;

    expect(embed.title).toBe("TypeError: x is undefined");
    expect(embed.url).toBe("https://botem-gc.sentry.io/issues/1/");
    expect(embed.color).toBe(0xe5484d);
    expect(embed.fields.map(field => [field.name, field.value])).toEqual([
      ["알림 규칙", "[FE] production 새 이슈"],
      ["환경", "production"],
      ["레벨", "error"],
      ["위치", "app/page.tsx"],
    ]);
  });

  it("사용자 IP·요청 헤더는 메시지에 포함하지 않는다", () => {
    const serialized = JSON.stringify(toDiscordMessage(payload));

    expect(serialized).not.toContain("1.2.3.4");
    expect(serialized).not.toContain("refreshToken");
  });

  it("값이 없는 필드는 빼고, 제목이 없으면 기본 제목을 쓴다", () => {
    const [embed] = toDiscordMessage({ data: { event: { level: "info" } } }).embeds;

    expect(embed.title).toBe("Sentry 알림");
    expect(embed.color).toBe(0x8b8d98);
    expect(embed.fields).toEqual([{ name: "레벨", value: "info", inline: true }]);
  });

  it("디스코드 제한(256자)을 넘는 제목은 자른다", () => {
    const [embed] = toDiscordMessage({ data: { event: { title: "a".repeat(300) } } }).embeds;

    expect(embed.title).toHaveLength(256);
  });
});

describe("sendToDiscord", () => {
  const DISCORD_URL = "https://discord.test/hook";
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("웹훅 URL이 없으면 요청하지 않고 false", async () => {
    // 핸들러가 없어 요청이 나가면 onUnhandledFrame으로 실패한다
    await expect(sendToDiscord(undefined, { embeds: [] })).resolves.toBe(false);
  });

  it("디스코드 응답이 성공이면 true", async () => {
    server.use(http.post(DISCORD_URL, () => new HttpResponse(null, { status: 204 })));

    await expect(sendToDiscord(DISCORD_URL, { embeds: [] })).resolves.toBe(true);
  });

  it("디스코드 응답이 실패면 false", async () => {
    server.use(http.post(DISCORD_URL, () => new HttpResponse(null, { status: 400 })));

    await expect(sendToDiscord(DISCORD_URL, { embeds: [] })).resolves.toBe(false);
  });
});
