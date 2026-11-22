"use client";

import { useRouter } from "next/navigation";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Title from "@/components/Title";
import LockedMotion from "@/components/effects/LockedMotion";

type FundingLockedViewProps = {
  // 공개되는 시각 (예: "10월 13일 0시"). 모르면 생략한다
  revealDateLabel?: string;
  // 있으면 홈 버튼 대신 카카오 로그인 버튼을 보여준다 (아직 로그인하지 않은 방문자)
  onKakaoLogin?: () => void;
};

// 서프라이즈를 받는 당사자가 링크로 들어왔을 때 펀딩 내용 대신 보여주는 화면
export default function FundingLockedView({
  revealDateLabel,
  onKakaoLogin,
}: FundingLockedViewProps) {
  const router = useRouter();
  const description = onKakaoLogin
    ? "로그인하고 보태러 갈까요?"
    : revealDateLabel
      ? `${revealDateLabel}에 만나요!`
      : "곧 만나요!";

  return (
    // pt-16은 지운 Header(64px) 높이, pb-28은 하단 CTA(그라데이션 36 + 버튼 56 + 여백 20) 높이다
    <main className="flex min-h-dvh flex-col pt-16 pb-28">
      <div className="px-5">
        <Title title="아직 비밀이에요" description={description} />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <LockedMotion />
      </div>
      {onKakaoLogin ? (
        <BottomCTA type="kakao" label="로그인하고 보태기" onClick={onKakaoLogin} />
      ) : (
        <BottomCTA>
          <Button size="xlarge" onClick={() => router.push("/home")}>
            내 홈으로
          </Button>
        </BottomCTA>
      )}
    </main>
  );
}
