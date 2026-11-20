import type { FundingDetailParticipant } from "@/types/funding/fundingDetail";
import type { MyBotemSheetFriend } from "@/widgets/funding/MyBotemSheet";

// 서버가 내 항목을 구분해 주지 않아 이름으로 찾는다. 같은 이름이 여럿이면 첫 번째를 내 것으로 본다
// TODO(API): 참여자에 contributionId나 mine이 생기면 이름 대신 그 값으로 찾는다
export const toMyBotemSheetFriends = ({
  participants,
  myName,
  hasUnconfirmed,
  isRejected = false,
}: {
  participants: FundingDetailParticipant[];
  myName: string | null | undefined;
  hasUnconfirmed: boolean;
  isRejected?: boolean;
}): MyBotemSheetFriend[] => {
  const friends = participants.map(({ order, name, profileImageUrl, contributedDate }) => ({
    id: order,
    name,
    profileImageUrl: profileImageUrl ?? undefined,
    contributedAt: contributedDate,
  }));
  const mineIndex = myName ? friends.findIndex(friend => friend.name === myName) : -1;
  if (mineIndex === -1) return friends;
  const mine = { ...friends[mineIndex], isMine: true, isConfirmed: !hasUnconfirmed, isRejected };
  return [mine, ...friends.filter((_, index) => index !== mineIndex)];
};
