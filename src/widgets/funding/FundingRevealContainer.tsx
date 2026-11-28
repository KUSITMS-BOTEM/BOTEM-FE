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
import { ApiError } from "@/types/api";
import type { FundingResultResponse } from "@/types/funding/fundingResult";
import FundingExtendFlow from "@/widgets/funding/FundingExtendFlow";
import FundingRevealEmptyView from "@/widgets/funding/FundingRevealEmptyView";
import FundingRevealView from "@/widgets/funding/FundingRevealView";
import RollingPaperContainer from "@/widgets/rolling-paper/RollingPaperContainer";
import IconClose from "@/assets/icons/icon-close.svg?react";

const MESSAGES_OPEN_QUERY = "messages=open";
// 참여자 0명으로 종료(CANCELLED)한 펀딩은 서버가 없는 펀딩으로 보고 404로 준다
const FUNDING_NOT_FOUND = "FUNDING_002";

export default function FundingRevealContainer() {
  const router = useRouter();
  const { pageExit, exitPage } = usePageExit();
  const { fundingId } = useParams<{ fundingId: string }>();
  const id = Number(fundingId);
  const {
    data: result,
    error,
    isLoading,
    refetch,
  } = useFundingResultQuery(id, true, [FUNDING_NOT_FOUND]);
  // 연장 가능 여부는 참여자 0명 화면에서만 쓴다. 결과 조회가 실패한 펀딩(종료 등)엔 관리 상세도 요청하지 않는다
  const { data: management } = useFundingManagementQuery(id, {
    enabled: result?.participantCount === 0,
  });
  const { mutate: openResult, isPending: isOpening } = useOpenFundingResultMutation();
  const [opening, setOpening] = useState(false);
  const { mutate: closeFunding, isPending: isClosePending } = useCloseFundingMutation();
  const [closing, setClosing] = useState(false);
  const searchParams = useSearchParams();
  // 시트에서 상세로 이동했다가 뒤로 오면 이 화면이 새로 마운트되므로, 시트가 열려 있었는지는 URL로 복원한다
  const [messagesOpen, setMessagesOpen] = useState(searchParams.get("messages") === "open");
  const [extendOpen, setExtendOpen] = useState(false);
  const close = () => router.replace("/home");

  // 보탠 친구가 없는 마감 펀딩은 한 번 더 마감 요청을 보내야 종료돼 홈 카드가 사라진다. 실패 때만 잠금을 푼다
  const endEmptyFunding = () => {
    setClosing(true);
    closeFunding(id, {
      onSuccess: () => {
        useFundingCloseToastStore.getState().mark();
        close();
      },
      onError: () => setClosing(false),
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
    if (error instanceof ApiError && error.code === FUNDING_NOT_FOUND) {
      return (
        <main className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-semantic-text-secondary [font:var(--semantic-subtext-large)]">
            이미 종료되었거나 찾을 수 없는 펀딩이에요
          </p>
          <Button onClick={close}>홈으로</Button>
        </main>
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
            isClosing={closing || isClosePending}
            onExtend={management?.actions.canExtend ? () => setExtendOpen(true) : undefined}
            onClose={endEmptyFunding}
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
