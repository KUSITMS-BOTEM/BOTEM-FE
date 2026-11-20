"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import RevealMotion from "@/components/effects/RevealMotion";
import Header from "@/components/Header";
import LoadingAnimation from "@/components/LoadingAnimation";
import PageExitMotion from "@/components/effects/PageExitMotion";
import { useOpenFundingResultMutation } from "@/hooks/mutations/funding/useOpenFundingResultMutation";
import { useFundingResultQuery } from "@/hooks/queries/funding/useFundingResultQuery";
import { usePageExit } from "@/hooks/usePageExit";
import type { FundingResultResponse } from "@/types/funding/fundingResult";
import FundingRevealEmptyView from "@/widgets/funding/FundingRevealEmptyView";
import RollingPaperContainer from "@/widgets/rolling-paper/RollingPaperContainer";
import IconClose from "@/assets/icons/icon-close.svg?react";

const TARGET_PERCENTAGE = 100;

export default function FundingRevealContainer() {
  const router = useRouter();
  const { pageExit, exitPage } = usePageExit();
  const { fundingId } = useParams<{ fundingId: string }>();
  const id = Number(fundingId);
  const { data: result, isLoading, refetch } = useFundingResultQuery(id);
  const { mutate: openResult, isPending: isOpening } = useOpenFundingResultMutation();
  const [opening, setOpening] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const close = () => router.replace("/home");

  const showMessages = (opened: FundingResultResponse) => {
    // 글을 남긴 친구가 없으면 메세지 도착 화면을 건너뛰고 선물 확인으로 간다
    if (opened.messageCount === 0) {
      router.push(`/funding/${fundingId}/result`);
      return;
    }
    setMessagesOpen(true);
  };

  const handleOpenMessages = () => {
    if (!result) return;
    // 이미 팡을 연 결과는 다시 열 필요가 없다 (시트를 닫았다가 다시 누른 경우)
    if (result.resultOpenedAt) {
      showMessages(result);
      return;
    }
    setOpening(true);
    openResult(id, {
      onSuccess: opened => {
        if (opened) showMessages(opened);
      },
      onSettled: () => setOpening(false),
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div role="status" className="flex flex-1 items-center justify-center">
          <LoadingAnimation size="large" />
          <span className="sr-only">펀딩 결과를 불러오는 중이에요</span>
        </div>
      );
    }
    if (!result) {
      return (
        <main className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-semantic-text-secondary [font:var(--semantic-subtext-large)]">
            펀딩 결과를 불러오지 못했어요
          </p>
          <Button onClick={() => refetch()}>다시 시도</Button>
        </main>
      );
    }
    if (result.participantCount === 0) return <FundingRevealEmptyView onClose={close} />;

    const amount = `${result.confirmedAmount.toLocaleString("ko-KR")}원이 모였어요`;
    const goalAchieved = result.achievementPercentage >= TARGET_PERCENTAGE;
    return (
      <>
        <main className="flex flex-1 flex-col items-center gap-6 px-5 pt-6 pb-32">
          <RevealMotion names={result.contributions.map(contribution => contribution.name)} />
          <div className="flex flex-col items-center gap-2 text-center [letter-spacing:var(--letter-spacing-default)]">
            <h1 className="text-semantic-text-strong [font-family:var(--font-family-a2-z)] text-[22px] [line-height:var(--line-height-default)] font-semibold whitespace-pre-line">
              {`친구 ${result.participantCount}명이\n보탬을 보냈어요!`}
            </h1>
            <p className="text-semantic-text-tertiary [font:var(--semantic-subtext-large)]">
              {goalAchieved ? `${amount} · 목표 달성` : amount}
            </p>
          </div>
        </main>
        <BottomCTA>
          <Button
            color="brand"
            size="xlarge"
            disabled={opening || isOpening}
            states={isOpening ? "loading" : "default"}
            onClick={handleOpenMessages}>
            메시지 열어보기
          </Button>
        </BottomCTA>
        <RollingPaperContainer
          fundingId={id}
          count={result.messageCount}
          open={messagesOpen}
          onClose={() => setMessagesOpen(false)}
        />
      </>
    );
  };

  return (
    <PageExitMotion exit={pageExit}>
      <div className="bg-semantic-background-default flex min-h-dvh flex-col">
        <Header
          title=""
          rightItems={[
            { icon: <IconClose />, ariaLabel: "닫기", onClick: () => exitPage("fade", close) },
          ]}
        />
        {renderContent()}
      </div>
    </PageExitMotion>
  );
}
