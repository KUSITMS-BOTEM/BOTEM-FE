"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // digest가 있으면 서버에서 난 에러라 instrumentation.ts의 onRequestError가 이미 보고했다
    if (error.digest) return;
    Sentry.captureException(error);
  }, [error]);

  return (
    <div>
      <p>오류가 발생했습니다.</p>
      <button type="button" onClick={reset}>
        다시 시도
      </button>
    </div>
  );
}
