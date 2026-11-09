"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <p>오류가 발생했습니다.</p>
        <button type="button" onClick={reset}>
          다시 시도
        </button>
      </body>
    </html>
  );
}
