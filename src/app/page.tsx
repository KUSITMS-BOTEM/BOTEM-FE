"use client";

import BottomCTA from "@/components/BottomCTA";
import Title from "@/components/Title";
import { useKakaoLoginUriMutation } from "@/hooks/mutations/auth/useKakaoLoginUriMutation";

import { handleKakaoLoginClick } from "./helpers";

export default function Home() {
  const { mutate } = useKakaoLoginUriMutation();

  return (
    <>
      <header className="flex h-16 w-full items-center justify-center p-2.5">
        {/* 디자인팀 로고 자산 전달 전까지 쓰는 임시 placeholder */}
        <div className="flex h-[29px] w-[49px] items-center justify-center bg-[#e4e4e4]">
          <span className="text-[15px] text-[#858585]">logo</span>
        </div>
      </header>
      <main className="flex flex-col gap-2 px-5">
        <Title
          type="a2z"
          title={"갖고 싶은 걸 등록하면\n친구들이 보태줘요"}
          description="총무의 일(확인·독촉·정산)은 보탬이 대신할게요"
        />
      </main>
      <BottomCTA
        type="kakao"
        onClick={() => handleKakaoLoginClick(mutate)}
        upper={
          <p className="text-semantic-text-tertiary text-center whitespace-pre-line [font:var(--semantic-label-x-small-weak)]">
            {"친구 펀딩에 보태러 왔나요?\n받은 링크로 들어가면 로그인없이 보탤 수 있어요"}
          </p>
        }
      />
    </>
  );
}
