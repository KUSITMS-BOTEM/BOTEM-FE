import type { ProfileBoxItem } from "@/components/ProfileBox";
import type { Color } from "@/constants/color";
import type { OwnerFundingDetailResponse } from "@/types/funding/ownerFundingDetail";
import { isValidUrl } from "@/utils/isValidUrl";

const PROFILE_PREVIEW_COUNT = 3;
const PARTICIPANT_COLORS: Color[] = ["orange", "lime", "pink", "blue"];

export const formatSurpriseTitle = (name: string) => `${name}의\n서프라이즈 펀딩`;

type Participant = OwnerFundingDetailResponse["participants"][number];

const toSafeImageUrl = (url: string | null) => (url && isValidUrl(url) ? url : undefined);

// 같은 회원이 여러 번 보태면 participants에 여러 줄로 오지만 order가 같다
const groupByOrder = (participants: Participant[]) => {
  const byOrder = new Map<number, Participant[]>();
  participants.forEach(participant => {
    byOrder.set(participant.order, [...(byOrder.get(participant.order) ?? []), participant]);
  });
  return [...byOrder.values()];
};

// 감사카드는 한 사람에게 한 장만 보낸다. 서버는 입금 확인(CONFIRMED)된 보탬에만 카드를 받아, 메시지만 보탠 줄로 보내면 실패한다
const toPeople = (participants: Participant[]) =>
  groupByOrder(participants).map(([first, ...rest]) => {
    const contributions = [first, ...rest];
    return {
      ...first,
      thankCardSent: contributions.some(({ thankCardSent }) => thankCardSent),
      thankCardContributionId: contributions.find(({ status }) => status === "CONFIRMED")
        ?.contributionId,
    };
  });

export function toOwnerFundingView(detail: OwnerFundingDetailResponse) {
  const people = toPeople(detail.participants);
  const profiles = people
    .slice(0, PROFILE_PREVIEW_COUNT)
    .map(({ profileImageUrl }, index): ProfileBoxItem => ({
      color: PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length],
      imageUrl: toSafeImageUrl(profileImageUrl),
    }));
  return {
    title:
      detail.type === "SURPRISE"
        ? formatSurpriseTitle(detail.celebrantName)
        : (detail.title ?? `${detail.celebrantName}의 펀딩`),
    story: detail.story ?? "",
    pledge: detail.promise ?? "",
    productName: detail.product.name,
    productImageUrl: detail.product.imageUrl,
    deadline: detail.deadline.slice(0, 10),
    // 응답엔 모인 금액이 없고 확정 달성률만 온다. 금액은 남은 금액·마감 판정용 근삿값이라 달성률 표시는 progress를 쓴다 (금액에서 다시 계산하면 부동소수점 오차로 1%가 깎인다)
    currentAmount: Math.ceil((detail.targetAmount * detail.confirmedPercentage) / 100),
    progress: Math.min(100, detail.confirmedPercentage),
    targetAmount: detail.targetAmount,
    // 조기 마감은 금액·마감일로 다시 계산할 수 없어 서버 상태를 그대로 쓴다. 목표 달성(100%)도 마감 전이지만 결과를 열 수 있어 닫힌 펀딩으로 본다
    closed: detail.managementState === "CLOSED" || detail.managementState === "TARGET_REACHED",
    extended: detail.extended,
    actions: detail.actions,
    profiles,
    extraParticipantCount: Math.max(detail.participantCount - profiles.length, 0),
    pendingContributionCount: detail.pendingContributionCount,
    messageCount: detail.messageCount,
    friends: people.map(person => ({
      id: person.contributionId,
      name: person.name,
      contributedAt: person.participatedAt,
      profileImageUrl: toSafeImageUrl(person.profileImageUrl),
      thankCardSent: person.thankCardSent,
      thankCardContributionId: person.thankCardContributionId,
    })),
  };
}
