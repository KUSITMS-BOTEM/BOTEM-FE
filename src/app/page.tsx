"use client";

import KakaoLoginButton from "@/components/KakaoLoginButton";
import { useKakaoLoginUriMutation } from "@/hooks/mutations/auth/useKakaoLoginUriMutation";

import { handleKakaoLoginClick } from "./helpers";

export default function Home() {
  const { mutate } = useKakaoLoginUriMutation();

  return (
    <div>
      랜딩 페이지 — 카카오로 시작하기
      <KakaoLoginButton onClick={() => handleKakaoLoginClick(mutate)}>
        카카오로 시작하기
      </KakaoLoginButton>
    </div>
  );
}
