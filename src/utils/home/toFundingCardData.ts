import type { FundingType, HomeFundingCardResponse } from "@/types/home/home";
import type { FundingCardType } from "@/widgets/home/FundingCard";
import type { FundingCardData } from "@/widgets/home/FundingCardCarousel";
import type { ProfileColor } from "@/widgets/home/ProfileBox";

const PROFILE_COLORS: ProfileColor[] = ["orange", "lime", "pink"];

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
  const visibleProfileCount = Math.min(card.participantCount, PROFILE_COLORS.length);

  return {
    id: card.fundingId,
    type: toCardType(card),
    title: `${nickname}님의 ${FUNDING_TYPE_LABEL[card.fundingType]} 펀딩`,
    productName: card.productName,
    productImageUrl: card.productImageUrl,
    progress: card.confirmedPercentage,
    dDay: card.remainingDays,
    targetAmount: card.targetAmount,
    participants: PROFILE_COLORS.slice(0, visibleProfileCount),
    extraParticipantCount: card.participantCount - visibleProfileCount,
    pendingCount: card.pendingContributionCount,
    isSurprise: card.fundingType === "SURPRISE",
  };
}
