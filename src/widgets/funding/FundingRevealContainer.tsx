"use client";

import { useParams, useRouter } from "next/navigation";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import RevealMotion from "@/components/effects/RevealMotion";
import Header from "@/components/Header";
import { useFundingRevealQuery } from "@/hooks/queries/funding/useFundingRevealQuery";
import FundingRevealEmptyView from "@/widgets/funding/FundingRevealEmptyView";
import IconClose from "@/assets/icons/icon-close.svg?react";

export default function FundingRevealContainer() {
  const router = useRouter();
  const { fundingId } = useParams<{ fundingId: string }>();
  const { data: reveal, isLoading, refetch } = useFundingRevealQuery(Number(fundingId));
  const close = () => router.replace("/home");

  const renderContent = () => {
    if (isLoading) return null;
    if (!reveal) {
      return (
        <main className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-semantic-text-secondary [font:var(--semantic-subtext-large)]">
            펀딩 결과를 불러오지 못했어요
          </p>
          <Button onClick={() => refetch()}>다시 시도</Button>
        </main>
      );
    }
    if (reveal.contributorNames.length === 0) return <FundingRevealEmptyView onClose={close} />;

    const amount = `${reveal.totalAmount.toLocaleString("ko-KR")}원이 모였어요`;
    return (
      <>
        <main className="flex flex-1 flex-col items-center gap-6 px-5 pt-6 pb-32">
          <RevealMotion names={reveal.contributorNames} />
          <div className="flex flex-col items-center gap-2 text-center [letter-spacing:var(--letter-spacing-default)]">
            <h1 className="text-semantic-text-strong [font-family:var(--font-family-a2-z)] text-[22px] [line-height:var(--line-height-default)] font-semibold whitespace-pre-line">
              {`친구 ${reveal.contributorNames.length}명이\n보탬을 보냈어요!`}
            </h1>
            <p className="text-semantic-text-tertiary [font:var(--semantic-subtext-large)]">
              {reveal.goalAchieved ? `${amount} · 목표 달성` : amount}
            </p>
          </div>
        </main>
        <BottomCTA>
          <Button color="brand" size="xlarge">
            메시지 열어보기
          </Button>
        </BottomCTA>
      </>
    );
  };

  return (
    <div className="bg-semantic-background-default flex min-h-dvh flex-col">
      <Header title="" rightItems={[{ icon: <IconClose />, ariaLabel: "닫기", onClick: close }]} />
      {renderContent()}
    </div>
  );
}
