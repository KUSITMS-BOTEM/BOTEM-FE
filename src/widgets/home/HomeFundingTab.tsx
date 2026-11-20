import { useRef, useState, type ReactNode } from "react";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { fundingResultQueryOptions } from "@/hooks/queries/funding/useFundingResultQuery";
import { useHomeFundingsQuery } from "@/hooks/queries/home/useHomeFundingsQuery";
import { useHomeNoFundingQuery } from "@/hooks/queries/home/useHomeNoFundingQuery";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import { toFundingCardData } from "@/utils/home/toFundingCardData";
import { getDisplayName } from "@/utils/user/getDisplayName";
import HomeEmptyView from "@/widgets/home/HomeEmptyView";
import HomeFundingView from "@/widgets/home/HomeFundingView";
import HomeLoadError from "@/widgets/home/HomeLoadError";
import HomeWishRecommendation from "@/widgets/home/HomeWishRecommendation";
import PendingContributionBottomSheet from "@/widgets/home/PendingContributionBottomSheet";

const REVEAL_PREFETCH_TIMEOUT_MS = 1500;

type HomeFundingTabProps = {
  onAddWish: () => void;
  onOpenFunding?: () => void;
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

  if (fundingsFailed || noFundingFailed) {
    const handleRetry = () => (fundingsFailed ? fundingsQuery.refetch() : noFundingQuery.refetch());
    return <HomeLoadError message="홈 정보를 불러오지 못했어요" onRetry={handleRetry} />;
  }

  if (fundingCards && fundingCards.length > 0) {
    if (!profile) return null;
    const cards = fundingCards.map(card => {
      const data = toFundingCardData(card, getDisplayName(profile));
      if (data.type === "default") {
        return { ...data, onClick: () => router.push(`/funding/${card.fundingId}`) };
      }
      if (data.type === "complete" || data.type === "open") {
        // 결과 화면에 로딩 상태가 끼지 않도록 데이터를 받아 둔 뒤 이동한다 (실패 시 결과 화면의 재시도 UI에 맡긴다)
        // 모션 줄이기 설정에서는 탭 즉시 호출돼 받는 동안의 연타를 막아야 한다 — 이동하면 언마운트되므로 풀지 않는다
        const openReveal = async () => {
          if (revealLockRef.current) return;
          revealLockRef.current = true;
          // 응답이 늦거나 오프라인이면 프리페치가 끝나지 않아 이동이 막히므로 제한 시간이 지나면 그대로 이동한다
          await Promise.race([
            queryClient.prefetchQuery(fundingResultQueryOptions(card.fundingId)),
            new Promise(resolve => setTimeout(resolve, REVEAL_PREFETCH_TIMEOUT_MS)),
          ]);
          router.push(`/funding/${card.fundingId}/reveal`);
        };
        return { ...data, onClick: openReveal };
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
        <PendingContributionBottomSheet
          open={isSheetOpen}
          fundingId={sheetFundingId}
          onClose={() => setIsSheetOpen(false)}
          onAllConfirmed={() => setIsSheetOpen(false)}
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
