"use client";

import { useRouter } from "next/navigation";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Title from "@/components/Title";
import LockedMotion from "@/components/effects/LockedMotion";

type FundingLockedViewProps = {
  // 공개되는 시각 (예: "10월 13일 0시")
  revealDateLabel: string;
};

// 서프라이즈를 받는 당사자가 링크로 들어왔을 때 펀딩 내용 대신 보여주는 화면
export default function FundingLockedView({ revealDateLabel }: FundingLockedViewProps) {
  const router = useRouter();

  return (
    // pt-16은 지운 Header(64px) 높이, pb-28은 하단 CTA(그라데이션 36 + 버튼 56 + 여백 20) 높이다
    <main className="flex min-h-dvh flex-col pt-16 pb-28">
      <div className="px-5">
        <Title title="아직 비밀이에요" description={`${revealDateLabel}에 만나요!`} />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <LockedMotion />
      </div>
      <BottomCTA>
        <Button size="xlarge" onClick={() => router.push("/home")}>
          홈으로 돌아가기
        </Button>
      </BottomCTA>
    </main>
  );
}
