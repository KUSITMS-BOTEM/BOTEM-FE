import { getProfileColor } from "@/components/Profile";
import type { FriendResponse } from "@/types/friend/friend";
import { getBirthdayDdayText } from "@/utils/friend/getBirthdayDdayText";
import { formatBirthdayDisplay } from "@/utils/user/formatBirthdayDisplay";

export const toFriendItemProps = (friend: FriendResponse, withDday = false) => ({
  name: friend.name,
  profileColor: getProfileColor(friend.userId),
  wishCount: friend.wishCount,
  imageUrl: friend.profileImageUrl ?? undefined,
  birthdayText: friend.birthday ? `생일 ${formatBirthdayDisplay(friend.birthday)}` : undefined,
  dDayText: withDday ? getBirthdayDdayText(friend.birthdayDday) : undefined,
});
