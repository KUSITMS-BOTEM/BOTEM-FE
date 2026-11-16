import type { Color } from "@/constants/color";
import type {
  FundingType,
  HomeFundingCardResponse,
  HomeFundingParticipantPreviewResponse,
} from "@/types/home/home";
import { isValidUrl } from "@/utils/isValidUrl";
import type { FundingCardType } from "@/widgets/home/FundingCard";
import type { FundingCardData } from "@/widgets/home/FundingCardCarousel";
import type { ProfileBoxItem } from "@/widgets/home/ProfileBox";

const FUNDING_TYPE_LABEL: Record<FundingType, string> = {
  BIRTHDAY: "생일",
  SURPRISE: "서프라이즈",
};

// 미리보기 응답에 참여자 id가 없어 순서로 색을 정한다 (Figma 순서)
const PARTICIPANT_COLORS: Color[] = ["orange", "lime", "pink", "blue"];

function toCardType(card: HomeFundingCardResponse): FundingCardType {
  if (card.cardType === "IN_PROGRESS") return "default";
  return card.pendingContributionCount > 0 ? "notification" : "open";
}

function toParticipant(
  preview: HomeFundingParticipantPreviewResponse,
  index: number,
): ProfileBoxItem {
  const { profileImageUrl } = preview;
  return {
    color: PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length],
    imageUrl: profileImageUrl && isValidUrl(profileImageUrl) ? profileImageUrl : undefined,
  };
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
    targetAmount: card.targetAmount,
    participants: card.participantPreviews.map(toParticipant),
    extraParticipantCount: Math.max(card.participantCount - card.participantPreviews.length, 0),
    pendingCount: card.pendingContributionCount,
    isSurprise: card.fundingType === "SURPRISE",
  };
}
