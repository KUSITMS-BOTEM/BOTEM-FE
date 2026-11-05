import { isTokenExpired } from "../isTokenExpired";

const FIXED_NOW = new Date("2024-01-01T00:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

function encodePayload(payload: unknown): string {
  const base64 = btoa(JSON.stringify(payload));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function buildToken(payloadSegment: string): string {
  return `header.${payloadSegment}.signature`;
}

describe("isTokenExpired", () => {
  it("exp가 미래 시각이면 false를 반환한다", () => {
    const futureExpSeconds = FIXED_NOW.getTime() / 1000 + 3600;
    const token = buildToken(encodePayload({ exp: futureExpSeconds }));

    expect(isTokenExpired(token)).toBe(false);
  });

  it("exp가 과거 시각이면 true를 반환한다", () => {
    const pastExpSeconds = FIXED_NOW.getTime() / 1000 - 3600;
    const token = buildToken(encodePayload({ exp: pastExpSeconds }));

    expect(isTokenExpired(token)).toBe(true);
  });

  it("exp가 정확히 현재 시각이면 true를 반환한다", () => {
    const nowExpSeconds = FIXED_NOW.getTime() / 1000;
    const token = buildToken(encodePayload({ exp: nowExpSeconds }));

    expect(isTokenExpired(token)).toBe(true);
  });

  it("payload 세그먼트가 없으면 true를 반환한다", () => {
    expect(isTokenExpired("headeronly")).toBe(true);
  });

  it("payload 세그먼트가 유효하지 않은 base64이면 true를 반환한다", () => {
    const token = buildToken("!!!invalid-base64!!!");

    expect(isTokenExpired(token)).toBe(true);
  });

  it("base64 디코딩은 성공하지만 JSON 파싱이 실패하면 true를 반환한다", () => {
    const token = buildToken(btoa("not json"));

    expect(isTokenExpired(token)).toBe(true);
  });

  it("exp 필드가 없으면 true를 반환한다", () => {
    const token = buildToken(encodePayload({ foo: "bar" }));

    expect(isTokenExpired(token)).toBe(true);
  });

  it("exp 필드가 숫자가 아니면 true를 반환한다", () => {
    const token = buildToken(encodePayload({ exp: "9999999999" }));

    expect(isTokenExpired(token)).toBe(true);
  });

  it("base64url 특수문자(-, _)가 포함된 payload도 정상적으로 디코딩된다", () => {
    // 표준 base64 인코딩 시 '+'가 나오는 payload({exp:9999999999, filler:"a~"})를 '-'로 치환해 구성한 세그먼트
    const token = buildToken("eyJleHAiOjk5OTk5OTk5OTksImZpbGxlciI6ImF-In0");

    expect(isTokenExpired(token)).toBe(false);
  });
});
