"use client";

import Badge from "@/components/Badge";
import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import Profile, { getProfileColor } from "@/components/Profile";
import { useSurpriseThankCardFriendsQuery } from "@/hooks/queries/funding/useSurpriseThankCardFriendsQuery";
import type { SurpriseThankCardFriend } from "@/types/funding/surprise";
import { formatDeadlineShort } from "@/utils/funding/formatDeadline";
import { isValidUrl } from "@/utils/isValidUrl";
import GiftVerifyFriendListSkeleton from "@/widgets/funding/skeleton/GiftVerifyFriendListSkeleton";

type SurpriseThankFriendsSheetProps = {
  open: boolean;
  fundingId: number;
  onClose: () => void;
  onThankCardClick: (friend: SurpriseThankCardFriend) => void;
};

// 서프라이즈를 연 받는 사람이 함께 준비한 친구에게 감사카드를 보내는 목록
export default function SurpriseThankFriendsSheet({
  open,
  fundingId,
  onClose,
  onThankCardClick,
}: SurpriseThankFriendsSheetProps) {
  const query = useSurpriseThankCardFriendsQuery(fundingId, open);
  const friends = query.data?.friends;

  return (
    <BottomSheet
      open={open}
      title="고마운 친구들"
      height="auto"
      onClose={onClose}
      showButtonFade={false}>
      <div className="flex w-full flex-col">
        <div className="flex w-full flex-col gap-2 pt-2 pb-5 tracking-(--letter-spacing-default)">
          <p className="text-semantic-text-strong [font:var(--semantic-title-a2-z-large)]">
            함께한 친구{friends && ` ${friends.length}명`}
          </p>
          <p className="text-semantic-text-secondary [font:var(--semantic-subtext-large)]">
            고마운 마음을 감사카드로 전해볼까요?
          </p>
        </div>
        {friends ? (
          friends.length > 0 ? (
            <ul className="flex w-full flex-col">
              {friends.map(friend => (
                <li key={friend.contributionId} className="flex items-center gap-3 py-3">
                  <Profile
                    imageUrl={
                      friend.profileImageUrl && isValidUrl(friend.profileImageUrl)
                        ? friend.profileImageUrl
                        : undefined
                    }
                    alt=""
                    color={getProfileColor(friend.contributionId)}
                    showIconButton={false}
                    className="size-9 shrink-0"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 tracking-(--letter-spacing-default)">
                    <span className="text-semantic-text-primary truncate [font:var(--semantic-label-small)]">
                      {friend.organizer ? `${friend.name} (준비한 친구)` : friend.name}
                    </span>
                    <span className="text-semantic-text-secondary truncate [font:var(--semantic-subtext-medium)]">
                      {formatDeadlineShort(friend.contributedDate)} 보탬
                    </span>
                  </div>
                  {friend.thankCardSent ? (
                    <Badge color="neutral" variant="weak" label="보냈어요" />
                  ) : (
                    <button
                      type="button"
                      aria-label={`${friend.name}에게 감사카드 보내기`}
                      onClick={() => onThankCardClick(friend)}
                      className="shrink-0 cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:outline-none">
                      <Badge color="brand" variant="fill" label="감사카드 보내기" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-semantic-text-tertiary py-10 text-center [font:var(--semantic-subtext-large)]">
              함께한 친구가 없어요
            </p>
          )
        ) : query.isError ? (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <p className="text-semantic-text-secondary [font:var(--semantic-subtext-large)]">
              함께한 친구를 불러오지 못했어요
            </p>
            <Button onClick={() => query.refetch()}>다시 시도</Button>
          </div>
        ) : (
          <GiftVerifyFriendListSkeleton />
        )}
      </div>
    </BottomSheet>
  );
}
