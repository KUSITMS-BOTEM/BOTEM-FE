import type { FriendResponse } from "@/types/friend/friend";
import { formatBirthdayDisplay } from "@/utils/user/formatBirthdayDisplay";

export const toFriendItemProps = (friend: FriendResponse, withDday = false) => ({
  name: friend.name,
  wishCount: friend.wishCount,
  imageUrl: friend.profileImageUrl ?? undefined,
  birthdayText: friend.birthday ? `생일 ${formatBirthdayDisplay(friend.birthday)}` : undefined,
  dDayText:
    withDday && friend.birthdayDday !== null
      ? friend.birthdayDday === 0
        ? "오늘이 생일이에요"
        : `생일까지 ${friend.birthdayDday}일 남았어요`
      : undefined,
});
