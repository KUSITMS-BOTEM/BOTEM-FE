"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import ErrorView from "@/components/ErrorView";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // digest가 있으면 서버에서 난 에러라 instrumentation.ts의 onRequestError가 이미 보고했다
    if (error.digest) return;
    Sentry.captureException(error);
  }, [error]);

  // isLoggedIn 쿠키는 httpOnly라 읽을 수 없다. "/"로 보내면 proxy.ts가 로그인 사용자를 /home으로 다시 보낸다.
  return <ErrorView onRetry={reset} onClose={() => router.replace("/")} />;
}
