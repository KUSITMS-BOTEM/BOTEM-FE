"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import Button from "@/components/Button";
import Header from "@/components/Header";
import LoadingAnimation from "@/components/LoadingAnimation";
import PageExitMotion from "@/components/effects/PageExitMotion";
import { useCloseFundingMutation } from "@/hooks/mutations/funding/useCloseFundingMutation";
import { useOpenFundingResultMutation } from "@/hooks/mutations/funding/useOpenFundingResultMutation";
import { useFundingManagementQuery } from "@/hooks/queries/funding/useFundingManagementQuery";
import { useFundingResultQuery } from "@/hooks/queries/funding/useFundingResultQuery";
import { usePageExit } from "@/hooks/usePageExit";
import { useFundingCloseToastStore } from "@/store/fundingCloseToastStore";
import type { FundingResultResponse } from "@/types/funding/fundingResult";
import FundingExtendFlow from "@/widgets/funding/FundingExtendFlow";
import FundingRevealEmptyView from "@/widgets/funding/FundingRevealEmptyView";
import FundingRevealView from "@/widgets/funding/FundingRevealView";
import RollingPaperContainer from "@/widgets/rolling-paper/RollingPaperContainer";
import IconClose from "@/assets/icons/icon-close.svg?react";

const MESSAGES_OPEN_QUERY = "messages=open";

export default function FundingRevealContainer() {
  const router = useRouter();
  const { pageExit, exitPage } = usePageExit();
  const { fundingId } = useParams<{ fundingId: string }>();
  const id = Number(fundingId);
  const { data: result, isLoading, refetch } = useFundingResultQuery(id);
  const { data: management } = useFundingManagementQuery(id);
  const { mutate: openResult, isPending: isOpening } = useOpenFundingResultMutation();
  const [opening, setOpening] = useState(false);
  const searchParams = useSearchParams();
  // 시트에서 상세로 이동했다가 뒤로 오면 이 화면이 새로 마운트되므로, 시트가 열려 있었는지는 URL로 복원한다
  const [messagesOpen, setMessagesOpen] = useState(searchParams.get("messages") === "open");
  const [extendOpen, setExtendOpen] = useState(false);
  const { mutate: closeFunding, isPending: isClosingFunding } = useCloseFundingMutation();
  const [closingFunding, setClosingFunding] = useState(false);
  const close = () => router.replace("/home");

  // 참여자 0명으로 마감일이 지난 펀딩을 종료한다. 이동하면 언마운트되므로 실패했을 때만 잠금을 푼다
  const handleCloseFunding = () => {
    setClosingFunding(true);
    closeFunding(id, {
      onSuccess: () => {
        useFundingCloseToastStore.getState().mark();
        close();
      },
      onError: () => setClosingFunding(false),
    });
  };

  const showMessages = (opened: FundingResultResponse) => {
    // 글을 남긴 친구가 없으면 메세지 도착 화면을 건너뛰고 선물 확인으로 간다
    if (opened.messageCount === 0) {
      router.push(`/funding/${fundingId}/result`);
      return;
    }
    window.history.replaceState(null, "", `?${MESSAGES_OPEN_QUERY}`);
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
    if (result.participantCount === 0) {
      return (
        <>
          <FundingRevealEmptyView
            onExtend={management?.actions.canExtend ? () => setExtendOpen(true) : undefined}
            onCloseFunding={handleCloseFunding}
            isClosing={closingFunding || isClosingFunding}
          />
          <FundingExtendFlow
            fundingId={id}
            open={extendOpen}
            collectedAmount={result.confirmedAmount}
            onClose={() => setExtendOpen(false)}
          />
        </>
      );
    }

    return (
      <>
        <FundingRevealView
          contributorNames={result.contributions.map(contribution => contribution.name)}
          participantCount={result.participantCount}
          confirmedAmount={result.confirmedAmount}
          achievementPercentage={result.achievementPercentage}
          isOpening={opening || isOpening}
          onOpenMessages={handleOpenMessages}
        />
        <RollingPaperContainer fundingId={id} open={messagesOpen} onClose={close} />
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
