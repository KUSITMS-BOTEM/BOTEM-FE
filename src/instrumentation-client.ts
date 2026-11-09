import * as Sentry from "@sentry/nextjs";

import { sentryBaseOptions } from "@/lib/sentry";

// 백엔드 CORS가 sentry-trace·baggage 헤더를 허용하기 전에 API 도메인을 넣으면 모든 API 요청이 preflight에서 막힌다.
// 비어 있으면 옵션을 넘기지 않아 SDK 기본값(같은 도메인만)으로 동작한다.
const traceTargets = process.env.NEXT_PUBLIC_SENTRY_TRACE_TARGETS?.split(",")
  .map(target => target.trim())
  .filter(Boolean);

Sentry.init({
  ...sentryBaseOptions,
  ...(traceTargets?.length ? { tracePropagationTargets: traceTargets } : {}),
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
