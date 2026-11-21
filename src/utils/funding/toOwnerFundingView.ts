import type { ProfileBoxItem } from "@/components/ProfileBox";
import type { Color } from "@/constants/color";
import type { OwnerFundingDetailResponse } from "@/types/funding/ownerFundingDetail";
import { isValidUrl } from "@/utils/isValidUrl";

const PROFILE_PREVIEW_COUNT = 3;
const PARTICIPANT_COLORS: Color[] = ["orange", "lime", "pink", "blue"];
const FUNDING_TYPE_TITLE = { BIRTHDAY: "생일 펀딩", SURPRISE: "서프라이즈 펀딩" } as const;

// 서프라이즈 제목은 서버의 "{닉네임}의 펀딩"에서 닉네임만 떼어 "{닉네임}의\n서프라이즈 펀딩"으로 줄을 나눈다. 형식이 다르면 서버 제목을 그대로 쓴다
const toSurpriseTitle = (title: string | null) => {
  const nickname = title?.match(/^(.+)의 펀딩$/)?.[1];
  return nickname ? `${nickname}의\n${FUNDING_TYPE_TITLE.SURPRISE}` : null;
};

type Participant = OwnerFundingDetailResponse["participants"][number];

const toSafeImageUrl = (url: string | null) => (url && isValidUrl(url) ? url : undefined);

// 같은 회원이 여러 번 보태면 participants에 여러 줄로 오지만 order가 같다
const toPeople = (participants: Participant[]) => {
  const firstByOrder = new Map<number, Participant>();
  participants.forEach(participant => {
    if (!firstByOrder.has(participant.order)) firstByOrder.set(participant.order, participant);
  });
  return [...firstByOrder.values()];
};

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
      (detail.type === "SURPRISE" ? toSurpriseTitle(detail.title) : null) ??
      detail.title ??
      FUNDING_TYPE_TITLE[detail.type],
    story: detail.story ?? "",
    pledge: detail.promise ?? "",
    productName: detail.product.name,
    productImageUrl: detail.product.imageUrl,
    deadline: detail.deadline.slice(0, 10),
    // 응답엔 모인 금액이 없고 확정 달성률만 온다. 금액은 남은 금액·마감 판정용 근삿값이라 달성률 표시는 progress를 쓴다 (금액에서 다시 계산하면 부동소수점 오차로 1%가 깎인다)
    currentAmount: Math.ceil((detail.targetAmount * detail.confirmedPercentage) / 100),
    progress: Math.min(100, detail.confirmedPercentage),
    targetAmount: detail.targetAmount,
    // 조기 마감은 금액·마감일로 다시 계산할 수 없어 서버 상태를 그대로 쓴다
    closed: detail.managementState === "CLOSED",
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
    })),
  };
}
