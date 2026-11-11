import { useState } from "react";

import { useHomeFundingsQuery } from "@/hooks/queries/home/useHomeFundingsQuery";
import { useHomeNoFundingQuery } from "@/hooks/queries/home/useHomeNoFundingQuery";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import { toFundingCardData } from "@/utils/home/toFundingCardData";
import HomeEmptyView from "@/widgets/home/HomeEmptyView";
import HomeFundingView from "@/widgets/home/HomeFundingView";
import HomeLoadError from "@/widgets/home/HomeLoadError";
import HomeWishRecommendation from "@/widgets/home/HomeWishRecommendation";
import PendingContributionBottomSheet from "@/widgets/home/PendingContributionBottomSheet";

type HomeFundingTabProps = {
  onAddWish: () => void;
  onOpenFunding?: () => void;
};

export default function HomeFundingTab({ onAddWish, onOpenFunding }: HomeFundingTabProps) {
  const { data: profile } = useMyProfileQuery();
  const fundingsQuery = useHomeFundingsQuery();
  const fundingCards = fundingsQuery.data?.fundingCards;
  const hasNoFunding = fundingCards?.length === 0;
  const noFundingQuery = useHomeNoFundingQuery({ enabled: hasNoFunding });
  const fundingsFailed = fundingsQuery.isError && !fundingCards;
  const noFundingFailed = hasNoFunding && noFundingQuery.isError && !noFundingQuery.data;
  const [pendingFundingId, setPendingFundingId] = useState<number | null>(null);
  const [pendingSheetOpen, setPendingSheetOpen] = useState(false);

  if (fundingsFailed || noFundingFailed) {
    const handleRetry = () => (fundingsFailed ? fundingsQuery.refetch() : noFundingQuery.refetch());
    return <HomeLoadError message="홈 정보를 불러오지 못했어요" onRetry={handleRetry} />;
  }

  if (fundingCards && fundingCards.length > 0) {
    if (!profile) return null;
    const cards = fundingCards.map(card => {
      const data = toFundingCardData(card, profile.nickname);
      if (data.type !== "notification") return data;
      const openPendingSheet = () => {
        setPendingFundingId(card.fundingId);
        setPendingSheetOpen(true);
      };
      return { ...data, onClick: openPendingSheet };
    });
    return (
      <>
        <HomeFundingView cards={cards} />
        <PendingContributionBottomSheet
          open={pendingSheetOpen}
          fundingId={pendingFundingId}
          onClose={() => setPendingSheetOpen(false)}
        />
      </>
    );
  }

  const noFunding = noFundingQuery.data;
  if (!noFunding) return null;
  if (noFunding.state === "EMPTY") return <HomeEmptyView onAddWish={onAddWish} />;
  return (
    <HomeWishRecommendation
      nickname={noFunding.nickname}
      wishes={noFunding.wishes.content}
      onOpenFunding={onOpenFunding}
    />
  );
}
