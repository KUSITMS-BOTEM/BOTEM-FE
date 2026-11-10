import { NextResponse, type NextRequest } from "next/server";

import {
  sendToDiscord,
  toDiscordMessage,
  verifySentrySignature,
  type SentryAlertPayload,
} from "./helpers";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("sentry-hook-signature");

  if (!verifySentrySignature(rawBody, signature, process.env.SENTRY_WEBHOOK_SECRET)) {
    return new NextResponse(null, { status: 401 });
  }

  if (request.headers.get("sentry-hook-resource") !== "event_alert") {
    return new NextResponse(null, { status: 200 });
  }

  const payload = JSON.parse(rawBody) as SentryAlertPayload;
  const sent = await sendToDiscord(
    process.env.DISCORD_SENTRY_WEBHOOK_URL,
    toDiscordMessage(payload),
  );

  return new NextResponse(null, { status: sent ? 200 : 502 });
}
