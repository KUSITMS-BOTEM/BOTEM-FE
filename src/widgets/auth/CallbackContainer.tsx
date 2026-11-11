"use client";

import { Suspense, useEffect, useRef } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import LoadingAnimation from "@/components/LoadingAnimation";
import { useKakaoLoginMutation } from "@/hooks/mutations/auth/useKakaoLoginMutation";

import { handleKakaoCallback, redirectToLandingAfterFailure } from "@/utils/auth/kakaoCallback";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate } = useKakaoLoginMutation();
  const hasRequested = useRef(false);

  useEffect(() => {
    // 카카오 인가 code는 1회용이라, StrictMode의 effect 이중 실행으로 같은 code가 두 번 교환되는 것을 막는다.
    if (hasRequested.current) return;
    hasRequested.current = true;

    const code = searchParams.get("code");
    if (!code) {
      redirectToLandingAfterFailure(router);
      return;
    }

    handleKakaoCallback(code, searchParams.get("state"), mutate, router);
  }, [searchParams, mutate, router]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-semantic-background-dim fixed inset-0 flex items-center justify-center">
      <LoadingAnimation size="large" color="white" />
      <span className="sr-only">로그인 처리 중입니다</span>
    </div>
  );
}

export default function CallbackContainer() {
  return (
    <Suspense>
      <CallbackContent />
    </Suspense>
  );
}
