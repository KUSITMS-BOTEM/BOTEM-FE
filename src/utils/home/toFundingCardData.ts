import type { Color } from "@/constants/color";
import type {
  HomeFundingCardResponse,
  HomeFundingParticipantPreviewResponse,
} from "@/types/home/home";
import { isValidUrl } from "@/utils/isValidUrl";
import { withSubjectParticle } from "@/utils/withSubjectParticle";
import type { FundingCardType } from "@/widgets/home/FundingCard";
import type { FundingCardData } from "@/widgets/home/FundingCardCarousel";
import type { ProfileBoxItem } from "@/components/ProfileBox";

// 미리보기 응답에 참여자 id가 없어 순서로 색을 정한다 (Figma 순서)
const PARTICIPANT_COLORS: Color[] = ["orange", "lime", "pink", "blue"];

const TARGET_PERCENTAGE = 100;

const isTargetReached = (card: HomeFundingCardResponse) =>
  card.confirmedPercentage >= TARGET_PERCENTAGE;

// 서프라이즈는 생일 펀딩의 earlyOpenable·팡 열기를 쓰지 않는다.
// 진행 중 목표를 채우면 지금 선물할지 묻고, 마감 뒤 선물 준비 전이면 칩으로 다음 할 일을 알린다. 준비를 마쳤으면 칩 없이 배지만 둔다
function toSurpriseCardType(card: HomeFundingCardResponse): FundingCardType {
  if (card.cardType === "IN_PROGRESS") {
    return isTargetReached(card) && card.pendingContributionCount === 0
      ? "earlyComplete"
      : "default";
  }
  if (card.surpriseStage === "GIFT_PREPARED") return "default";
  return card.pendingContributionCount > 0 ? "notification" : "complete";
}

// 마감된 서프라이즈의 선물 준비 전 칩 문구. 목표를 못 채웠으면 '마감됐어요'로 시작한다
function toSurpriseFxLabel(card: HomeFundingCardResponse): string | undefined {
  if (card.cardType !== "CLOSED_UNOPENED" || card.surpriseStage === "GIFT_PREPARED") {
    return undefined;
  }
  const pending = card.pendingContributionCount;
  if (isTargetReached(card)) {
    return pending > 0
      ? `확인 대기 ${pending}건을 확인하면 열어볼 수 있어요`
      : "다 모였어요. 선물을 준비할까요?";
  }
  return pending > 0
    ? `마감됐어요. 확인 대기 ${pending}건부터 확인해요`
    : "마감됐어요. 선물을 준비할까요?";
}

function toCardType(card: HomeFundingCardResponse): FundingCardType {
  if (card.fundingType === "SURPRISE") return toSurpriseCardType(card);
  if (card.cardType === "IN_PROGRESS") return card.earlyOpenable ? "earlyComplete" : "default";
  if (card.pendingContributionCount > 0) return "notification";
  return card.participantCount > 0 ? "complete" : "open";
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
  const type = toCardType(card);
  return {
    id: card.fundingId,
    type,
    title: `${nickname}님의 펀딩`,
    productName: card.productName,
    productImageUrl: card.productImageUrl,
    progress: Math.min(100, card.confirmedPercentage),
    dDay: card.remainingDays,
    targetAmount: card.targetAmount,
    participants: card.participantPreviews.map(toParticipant),
    extraParticipantCount: Math.max(card.participantCount - card.participantPreviews.length, 0),
    pendingCount: card.pendingContributionCount,
    isSurprise: card.fundingType === "SURPRISE",
    // 선물 준비를 마쳤지만 공개 전이라 받는 사람은 아직 선물을 못 받은 상태다 (Figma SUR-PG-007 홈 카드)
    statusLabel:
      card.surpriseStage === "GIFT_PREPARED" && card.recipientName
        ? `${withSubjectParticle(card.recipientName)} 아직 못받았어요`
        : undefined,
    fxLabelText: card.fundingType === "SURPRISE" ? toSurpriseFxLabel(card) : undefined,
  };
}
