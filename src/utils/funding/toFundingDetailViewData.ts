import type { FundingManagementResponse } from "@/types/funding/fundingManagement";

const VISIBLE_PROFILE_COUNT = 3;

// 개설자 펀딩 관리 응답을 펀딩 상세 화면이 쓰는 값으로 바꾼다
export function toFundingDetailViewData(management: FundingManagementResponse) {
  // 참여 기록마다 한 줄이라 같은 사람이 여러 번 보태면 order가 겹친다. 첫 참여만 남긴다
  const seenOrders = new Set<number>();
  const people = [...management.participants]
    .sort((a, b) => a.participatedAt.localeCompare(b.participatedAt))
    .filter(p => !seenOrders.has(p.order) && seenOrders.add(p.order))
    .sort((a, b) => a.order - b.order);
  // 프로필 색은 화면에서 order로 정한다
  const profiles = people.slice(0, VISIBLE_PROFILE_COUNT).map(person => ({
    order: person.order,
    imageUrl: person.profileImageUrl ?? undefined,
  }));

  return {
    title: management.title ?? "",
    story: management.story ?? undefined,
    pledge: management.promise ?? undefined,
    productName: management.product.name,
    productImageUrl: management.product.imageUrl,
    deadline: management.deadline.slice(0, 10),
    // 서버는 참여자에게 금액을 숨기려 달성률만 준다. 카드가 금액에서 달성률을 내림으로 다시 계산하므로 올림해 같은 %가 나오게 한다
    currentAmount: management.targetReached
      ? management.targetAmount
      : Math.ceil((management.targetAmount * management.confirmedPercentage) / 100),
    targetAmount: management.targetAmount,
    profiles,
    extraParticipantCount: Math.max(0, management.participantCount - profiles.length),
    messageCount: management.messageCount,
    friends: people.map(person => ({
      id: person.contributionId,
      name: person.name,
      contributedAt: person.participatedAt,
      profileImageUrl: person.profileImageUrl ?? undefined,
      thankCardSent: person.thankCardSent,
    })),
    extended: management.extended,
    actions: management.actions,
  };
}
