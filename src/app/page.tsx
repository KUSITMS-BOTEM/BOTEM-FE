"use client";

import dynamic from "next/dynamic";

import BottomCTA from "@/components/BottomCTA";
import BusinessFooter from "@/components/BusinessFooter";
import Logo from "@/components/Logo";
import Title from "@/components/Title";
import { useKakaoLoginUriMutation } from "@/hooks/mutations/auth/useKakaoLoginUriMutation";
import { handleKakaoLoginClick } from "@/utils/auth/handleKakaoLoginClick";

const HeroMotion = dynamic(() => import("@/components/effects/hero-motion/HeroMotion"), {
  ssr: false,
});

export default function Home() {
  const { mutate } = useKakaoLoginUriMutation();

  return (
    <>
      <div className="flex min-h-dvh flex-col">
        <header className="flex h-16 w-full items-center px-5 py-2.5">
          <Logo />
        </header>
        <main className="flex flex-1 flex-col gap-2 px-5">
          <Title
            type="a2z"
            title={"갖고 싶은 걸 등록하면\n친구들이 보태줘요"}
            className="h-[131px]"
          />
          <div className="flex flex-1 items-center justify-center">
            <HeroMotion />
          </div>
        </main>
        {/* 첫 화면에서는 하단에 붙어 있고, 스크롤하면 아래 푸터와 함께 올라간다 */}
        <BottomCTA
          className="static"
          type="kakao"
          onClick={() => handleKakaoLoginClick(mutate)}
          upper={
            <p className="text-semantic-text-tertiary text-center whitespace-pre-line [font:var(--semantic-label-x-small-weak)]">
              {"친구 펀딩에 보태러 왔나요?\n받은 링크로 들어가면 로그인없이 보탤 수 있어요"}
            </p>
          }
        />
      </div>
      <div className="px-5 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <BusinessFooter />
      </div>
    </>
  );
}
