import * as Sentry from "@sentry/nextjs";

// 개발 서버가 register()를 다시 부르면 listen이 겹치지 않도록 전역에 켠 여부를 남긴다
const globalForMsw = globalThis as { __mswServerStarted?: boolean };

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");

    // 서버 컴포넌트의 fetch(serverApi)는 브라우저 서비스 워커를 거치지 않아 msw/node로 따로 가로챈다. MswProvider와 같은 조건으로, production에서는 값과 무관하게 막는다
    const mswEnabled =
      process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_MSW_ENABLED === "1";
    if (mswEnabled && !globalForMsw.__mswServerStarted) {
      globalForMsw.__mswServerStarted = true;
      const { server } = await import("./mocks/server");
      server.listen({ onUnhandledFrame: "bypass" });
    }
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
