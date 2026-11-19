import type { ProfileBoxItem } from "@/components/ProfileBox";
import type { Color } from "@/constants/color";
import type { OwnerFundingDetailResponse } from "@/types/funding/ownerFundingDetail";
import { isValidUrl } from "@/utils/isValidUrl";

const PROFILE_PREVIEW_COUNT = 3;
const PARTICIPANT_COLORS: Color[] = ["orange", "lime", "pink", "blue"];
const FUNDING_TYPE_TITLE = { BIRTHDAY: "생일 펀딩", SURPRISE: "서프라이즈 펀딩" } as const;

// 같은 회원이 여러 번 보태면 participants에 여러 줄로 오지만 order가 같다
const toProfiles = (participants: OwnerFundingDetailResponse["participants"]) => {
  const firstByOrder = new Map<number, (typeof participants)[number]>();
  participants.forEach(participant => {
    if (!firstByOrder.has(participant.order)) firstByOrder.set(participant.order, participant);
  });
  return [...firstByOrder.values()]
    .slice(0, PROFILE_PREVIEW_COUNT)
    .map(({ profileImageUrl }, index): ProfileBoxItem => ({
      color: PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length],
      imageUrl: profileImageUrl && isValidUrl(profileImageUrl) ? profileImageUrl : undefined,
    }));
};

export function toOwnerFundingView(detail: OwnerFundingDetailResponse) {
  const profiles = toProfiles(detail.participants);
  return {
    title: detail.title ?? FUNDING_TYPE_TITLE[detail.type],
    story: detail.story ?? "",
    pledge: detail.promise ?? "",
    productName: detail.product.name,
    productImageUrl: detail.product.imageUrl,
    deadline: detail.deadline.slice(0, 10),
    // 응답엔 모인 금액이 없고 확정 달성률만 온다. 진행 카드가 금액으로 달성률을 다시 계산하므로 같은 달성률이 나오는 금액으로 넘긴다 (올림해야 내림 계산에서 1%가 깎이지 않는다)
    currentAmount: Math.ceil((detail.targetAmount * detail.confirmedPercentage) / 100),
    targetAmount: detail.targetAmount,
    profiles,
    extraParticipantCount: Math.max(detail.participantCount - profiles.length, 0),
    pendingContributionCount: detail.pendingContributionCount,
    messageCount: detail.messageCount,
  };
}
