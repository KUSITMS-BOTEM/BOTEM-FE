const PII_HEADER_DENY = ["forwarded", "-ip", "remote-", "via", "-user"];

const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;
const isLocalEnabled = process.env.NEXT_PUBLIC_SENTRY_LOCAL_ENABLED === "1";

// client·server·edge 세 런타임의 Sentry.init 공통 옵션
export const sentryBaseOptions = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Vercel 배포는 항상, 로컬은 스위치를 켰을 때만 수집한다 — Sentry에서는 environment(local / preview / production)로 구분
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN) && (Boolean(vercelEnv) || isLocalEnabled),
  environment: vercelEnv ?? "local",
  tracesSampleRate: 1.0,
  // v11은 dataCollection을 비우면 쿠키·요청 본문·사용자 정보까지 전부 수집한다.
  // refreshToken 쿠키와 계좌 정보 같은 요청 본문이 넘어가지 않도록 v10 기본값(최소 수집)으로 고정한다.
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: {
      request: { deny: PII_HEADER_DENY },
      response: { deny: PII_HEADER_DENY },
    },
    httpBodies: [],
    urlQueryParams: { deny: ["code", "state"] },
    genAI: { inputs: false, outputs: false },
    databaseQueryData: false,
    graphQL: { document: false, variables: false },
  },
};
