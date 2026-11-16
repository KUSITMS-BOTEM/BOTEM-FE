"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

import BottomCTA from "@/components/BottomCTA";
import Logo from "@/components/Logo";
import Title from "@/components/Title";
import { useKakaoLoginUriMutation } from "@/hooks/mutations/auth/useKakaoLoginUriMutation";

// framer-motion과 2천 줄 모션 데이터를 첫 번들에서 분리한다. 영역 높이가 고정이라 ssr:false여도 레이아웃 시프트가 없다.
const HeroMotion = dynamic(() => import("@/components/effects/hero-motion/HeroMotion"), {
  ssr: false,
});

import { handleKakaoLoginClick } from "./helpers";

export default function Home() {
  const { mutate } = useKakaoLoginUriMutation();

  return (
    <>
      <header className="flex h-16 w-full items-center px-5 py-2.5">
        <Logo />
      </header>
      <main className="flex flex-1 flex-col gap-2 px-5">
        <Title
          type="a2z"
          title={"갖고 싶은 걸 등록하면\n친구들이 보태줘요"}
          className="h-[131px]"
        />
        {/* 하단 고정 CTA(약 210px)를 뺀 남은 공간의 정중앙에 모션을 둔다 */}
        <div className="flex flex-1 items-center justify-center pb-52">
          <HeroMotion />
        </div>
      </main>
      <BottomCTA
        type="kakao"
        onClick={() => handleKakaoLoginClick(mutate)}
        upper={
          <p className="text-semantic-text-tertiary text-center whitespace-pre-line [font:var(--semantic-label-x-small-weak)]">
            {"친구 펀딩에 보태러 왔나요?\n받은 링크로 들어가면 로그인없이 보탤 수 있어요"}
          </p>
        }
        lower={
          <Link
            href="/privacy"
            className="text-semantic-text-tertiary underline [font:var(--semantic-label-x-small-weak)]">
            개인정보처리방침
          </Link>
        }
      />
    </>
  );
}
