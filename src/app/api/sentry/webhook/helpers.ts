import { createHmac, timingSafeEqual } from "node:crypto";

type SentryAlertEvent = {
  title?: string;
  web_url?: string;
  environment?: string;
  level?: string;
  culprit?: string;
};

export type SentryAlertPayload = {
  data?: {
    event?: SentryAlertEvent;
    triggered_rule?: string;
  };
};

type DiscordEmbedField = { name: string; value: string; inline?: boolean };

type DiscordMessage = {
  embeds: {
    title: string;
    url?: string;
    color: number;
    fields: DiscordEmbedField[];
  }[];
};

const DISCORD_TITLE_MAX = 256;
const DISCORD_FIELD_VALUE_MAX = 1024;

const LEVEL_COLORS: Record<string, number> = {
  fatal: 0xe5484d,
  error: 0xe5484d,
  warning: 0xf5a524,
};
const DEFAULT_COLOR = 0x8b8d98;

function hmacHex(body: string, secret: string) {
  return createHmac("sha256", secret).update(body, "utf8").digest("hex");
}

function safeEqual(a: string, b: string) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

export function verifySentrySignature(
  rawBody: string,
  signature: string | null,
  secret: string | undefined,
) {
  if (!signature || !secret) return false;
  if (safeEqual(hmacHex(rawBody, secret), signature)) return true;

  // Sentry 문서 예시는 파싱 후 다시 직렬화한 본문으로 서명하므로, 원문과 공백 등이 다를 때를 대비해 한 번 더 확인한다
  try {
    return safeEqual(hmacHex(JSON.stringify(JSON.parse(rawBody)), secret), signature);
  } catch {
    return false;
  }
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

// 이벤트 본문에는 요청 헤더·사용자 IP도 들어 있어, 알림에 필요한 필드만 골라 디스코드로 보낸다
export function toDiscordMessage(payload: SentryAlertPayload): DiscordMessage {
  const event = payload.data?.event ?? {};
  const candidates: [string, string | undefined][] = [
    ["알림 규칙", payload.data?.triggered_rule],
    ["환경", event.environment],
    ["레벨", event.level],
    ["위치", event.culprit],
  ];
  const fields = candidates
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([name, value]) => ({
      name,
      value: truncate(value, DISCORD_FIELD_VALUE_MAX),
      inline: name !== "위치",
    }));

  return {
    embeds: [
      {
        title: truncate(event.title ?? "Sentry 알림", DISCORD_TITLE_MAX),
        url: event.web_url,
        color: LEVEL_COLORS[event.level ?? ""] ?? DEFAULT_COLOR,
        fields,
      },
    ],
  };
}

export async function sendToDiscord(webhookUrl: string | undefined, message: DiscordMessage) {
  if (!webhookUrl) return false;
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
  return res.ok;
}
