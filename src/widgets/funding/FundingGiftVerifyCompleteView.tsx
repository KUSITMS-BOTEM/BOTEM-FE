"use client";

import dynamic from "next/dynamic";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Title from "@/components/Title";
import ToastMessage from "@/components/ToastMessage";
import { useShareLink } from "@/hooks/useShareLink";

const HeroMotion = dynamic(() => import("@/components/effects/hero-motion/HeroMotion"), {
  ssr: false,
});

type FundingGiftVerifyCompleteViewProps = {
  fundingId: string;
};

export default function FundingGiftVerifyCompleteView({
  fundingId,
}: FundingGiftVerifyCompleteViewProps) {
  const { toast, share } = useShareLink();

  // 마감된 펀딩의 공유 링크는 선물 도착 인증 화면을 보여준다
  const handleShare = () =>
    share({
      title: "선물 도착 인증이 왔어요",
      url: `${window.location.origin}/share/${fundingId}`,
    });

  return (
    <>
      <div className="flex flex-1 flex-col gap-3 px-5">
        <Title type="a2z" title={"보태준 친구들에게\n선물 도착 인증을 보냈어요!"} />
        <div className="flex flex-1 items-center justify-center pb-40">
          <HeroMotion />
        </div>
      </div>
      <BottomCTA>
        <Button color="brand" size="xlarge" onClick={handleShare}>
          친구에게 공유하기
        </Button>
      </BottomCTA>
      <ToastMessage
        show={toast !== null}
        state={toast === "success"}
        text={toast === "fail" ? "링크를 복사하지 못했어요" : "링크를 복사했어요"}
        className="pointer-events-none fixed bottom-32 left-1/2 z-20 -translate-x-1/2"
      />
    </>
  );
}
