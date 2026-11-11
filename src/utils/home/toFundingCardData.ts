import type { FundingType, HomeFundingCardResponse } from "@/types/home/home";
import type { FundingCardType } from "@/widgets/home/FundingCard";
import type { FundingCardData } from "@/widgets/home/FundingCardCarousel";

const FUNDING_TYPE_LABEL: Record<FundingType, string> = {
  BIRTHDAY: "생일",
  SURPRISE: "서프라이즈",
};

function toCardType(card: HomeFundingCardResponse): FundingCardType {
  if (card.cardType === "IN_PROGRESS") return "default";
  return card.pendingContributionCount > 0 ? "notification" : "open";
}

export function toFundingCardData(
  card: HomeFundingCardResponse,
  nickname: string,
): FundingCardData {
  return {
    id: card.fundingId,
    type: toCardType(card),
    title: `${nickname}님의 ${FUNDING_TYPE_LABEL[card.fundingType]} 펀딩`,
    productName: card.productName,
    productImageUrl: card.productImageUrl,
    progress: card.pendingPercentage,
    dDay: card.remainingDays,
    pendingCount: card.pendingContributionCount,
    isSurprise: card.fundingType === "SURPRISE",
  };
}
