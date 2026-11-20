import { useEffect, useRef, useState, type ReactNode } from "react";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { fundingResultQueryOptions } from "@/hooks/queries/funding/useFundingResultQuery";
import { useHomeFundingsQuery } from "@/hooks/queries/home/useHomeFundingsQuery";
import { useHomeNoFundingQuery } from "@/hooks/queries/home/useHomeNoFundingQuery";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import type { BottomSheetEnterTransition } from "@/components/BottomSheet";
import { toFundingCardData } from "@/utils/home/toFundingCardData";
import { getDisplayName } from "@/utils/user/getDisplayName";
import HomeEmptyView from "@/widgets/home/HomeEmptyView";
import HomeFundingView from "@/widgets/home/HomeFundingView";
import HomeLoadError from "@/widgets/home/HomeLoadError";
import HomeWishRecommendation from "@/widgets/home/HomeWishRecommendation";
import DepositConfirmSheet from "@/widgets/funding/DepositConfirmSheet";
import type { HomeWishCardResponse } from "@/types/home/home";

const REVEAL_PREFETCH_TIMEOUT_MS = 1500;
// Pending 카드 탭 전환 스펙: 카드 눌림(0–0.32s)이 먼저 보이도록 딤(0.25–0.6s)·시트(0.28–0.85s, 오버슈트 없음) 진입을 늦춘다
const PENDING_SHEET_ENTER: BottomSheetEnterTransition = {
  dim: { delay: 0.25, duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  sheet: { delay: 0.28, duration: 0.57, ease: [0.32, 0.72, 0, 1] },
};

type HomeFundingTabProps = {
  onAddWish: () => void;
  onOpenFunding?: (wish: HomeWishCardResponse) => void;
  banner?: ReactNode;
};

export default function HomeFundingTab({ onAddWish, onOpenFunding, banner }: HomeFundingTabProps) {
  const { data: profile } = useMyProfileQuery();
  const fundingsQuery = useHomeFundingsQuery();
  const fundingCards = fundingsQuery.data?.fundingCards;
  const hasNoFunding = fundingCards?.length === 0;
  const noFundingQuery = useHomeNoFundingQuery({ enabled: hasNoFunding });
  const fundingsFailed = fundingsQuery.isError && !fundingCards;
  const noFundingFailed = hasNoFunding && noFundingQuery.isError && !noFundingQuery.data;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [sheetFundingId, setSheetFundingId] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const revealLockRef = useRef(false);
  // 프리페치를 기다리는 동안 다른 화면으로 떠났으면 늦게 끝난 공개 화면 이동을 버린다
  const isUnmountedRef = useRef(false);
  useEffect(() => {
    isUnmountedRef.current = false;
    return () => {
      isUnmountedRef.current = true;
    };
  }, []);

  if (fundingsFailed || noFundingFailed) {
    const handleRetry = () => (fundingsFailed ? fundingsQuery.refetch() : noFundingQuery.refetch());
    return <HomeLoadError message="홈 정보를 불러오지 못했어요" onRetry={handleRetry} />;
  }

  // 결과 화면에 로딩 상태가 끼지 않도록 데이터를 받아 둔 뒤 이동한다 (실패 시 결과 화면의 재시도 UI에 맡긴다)
  // 모션 줄이기 설정에서는 탭 즉시 호출돼 받는 동안의 연타를 막아야 한다 — 이동하면 언마운트되므로 풀지 않는다
  const openReveal = async (fundingId: number) => {
    if (revealLockRef.current) return;
    revealLockRef.current = true;
    // 응답이 늦거나 오프라인이면 프리페치가 끝나지 않아 이동이 막히므로 제한 시간이 지나면 그대로 이동한다
    await Promise.race([
      queryClient.prefetchQuery(fundingResultQueryOptions(fundingId)),
      new Promise(resolve => setTimeout(resolve, REVEAL_PREFETCH_TIMEOUT_MS)),
    ]);
    if (isUnmountedRef.current) return;
    router.push(`/funding/${fundingId}/reveal`);
  };

  if (fundingCards && fundingCards.length > 0) {
    if (!profile) return null;
    const cards = fundingCards.map(card => {
      const data = toFundingCardData(card, getDisplayName(profile));
      if (data.type === "default" || data.type === "open") {
        return { ...data, onClick: () => router.push(`/funding/${card.fundingId}`) };
      }
      if (data.type === "complete" || data.type === "earlyComplete") {
        return { ...data, onClick: () => openReveal(card.fundingId) };
      }
      const openCardSheet = () => {
        setSheetFundingId(card.fundingId);
        setIsSheetOpen(true);
      };
      // 시트가 떠 있는 동안 해당 카드의 흔들림 루프를 멈춘다 (닫히면 재개)
      const fxPaused = isSheetOpen && sheetFundingId === card.fundingId;
      return { ...data, fxPaused, onClick: openCardSheet };
    });
    return (
      <>
        <HomeFundingView cards={cards} banner={banner} />
        <DepositConfirmSheet
          variant="preReveal"
          open={isSheetOpen}
          fundingId={sheetFundingId}
          enterTransition={PENDING_SHEET_ENTER}
          onClose={() => setIsSheetOpen(false)}
          onReveal={() => sheetFundingId !== null && openReveal(sheetFundingId)}
        />
      </>
    );
  }

  const noFunding = noFundingQuery.data;
  if (!noFunding) return null;
  if (noFunding.state === "EMPTY") return <HomeEmptyView onAddWish={onAddWish} banner={banner} />;
  return (
    <HomeWishRecommendation
      nickname={noFunding.nickname}
      wishes={noFunding.wishes.content}
      onOpenFunding={onOpenFunding}
      banner={banner}
    />
  );
}
