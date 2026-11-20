"use client";

import BottomSheet from "@/components/BottomSheet";
import Profile, { getProfileColor } from "@/components/Profile";
import { formatContributedDate } from "@/utils/funding/formatContributedDate";
import BotemPopupRow from "@/widgets/funding/BotemPopupRow";
import { getUnconfirmedText, type BotemPopupFriend } from "@/widgets/funding/BotemPopup";
import IconNotification from "@/assets/icons/icon-notification.svg?react";
import IconTerms from "@/assets/icons/multicolor/icon-terms.svg?react";

export type MyBotemSheetFriend = BotemPopupFriend & {
  // 내가 보탠 항목이다. 목록 맨 위에 '내 보탬'으로 보여준다
  isMine?: boolean;
  // 개설자가 이 보탬을 확인했는지. 내 보탬이면서 false일 때만 안내 문구를 띄운다
  isConfirmed?: boolean;
};

type MyBotemSheetProps = {
  open: boolean;
  unconfirmedCount: number;
  friends: MyBotemSheetFriend[];
  ownerName: string;
  isClosed: boolean;
  onClose: () => void;
  onEditClick: () => void;
};

export default function MyBotemSheet({
  open,
  unconfirmedCount,
  friends,
  ownerName,
  isClosed,
  onClose,
  onEditClick,
}: MyBotemSheetProps) {
  const hasUnconfirmed = unconfirmedCount > 0;
  const unconfirmedText = getUnconfirmedText({
    count: unconfirmedCount,
    ownerName,
    isHost: false,
    isOwner: false,
  });
  // 내 보탬이 맨 위에 오고 나머지는 원래 순서를 지킨다
  const sortedFriends = [...friends].sort((a, b) => Number(!!b.isMine) - Number(!!a.isMine));

  return (
    <BottomSheet open={open} title="내 보탬 확인" height="auto" onClose={onClose}>
      <div className="flex w-full flex-col">
        <div className="flex w-full flex-col pb-2">
          <BotemPopupRow
            highlighted={hasUnconfirmed}
            icon={
              <IconNotification
                className={
                  hasUnconfirmed ? "text-semantic-icon-danger" : "text-semantic-icon-primary"
                }
              />
            }
            title={unconfirmedText.title}
            description={unconfirmedText.description}
          />
          {!isClosed && (
            <BotemPopupRow
              icon={<IconTerms />}
              title="내 보탬 수정하기"
              description="마감일까지 수정할 수 있어요"
              onClick={onEditClick}
            />
          )}
        </div>
        <div aria-hidden className="bg-semantic-border-weak h-px w-full" />
        <div className="flex w-full flex-col pt-3">
          <div className="flex h-8 items-center">
            <p className="text-semantic-text-tertiary [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-x-small-weak)]">
              보태준 친구들 {friends.length}명
            </p>
          </div>
          {friends.length === 0 ? (
            <p className="text-semantic-text-secondary flex h-[178px] items-center justify-center [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-subtext-medium)]">
              아직 보태준 친구가 없어요
            </p>
          ) : (
            <ul>
              {sortedFriends.map(friend => (
                <li key={friend.id} className="flex items-center gap-3 py-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Profile
                      imageUrl={friend.profileImageUrl}
                      alt=""
                      color={getProfileColor(friend.id)}
                      showIconButton={false}
                      className="size-9 shrink-0"
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5 [letter-spacing:var(--letter-spacing-default)]">
                      {friend.isMine && (
                        <span className="text-semantic-text-secondary truncate [font:var(--semantic-subtext-medium)]">
                          내 보탬
                        </span>
                      )}
                      <span className="text-semantic-text-primary truncate [font:var(--semantic-label-small)]">
                        {friend.name}
                      </span>
                      {friend.isMine && friend.isConfirmed === false && (
                        <span className="text-semantic-text-tertiary truncate [font:var(--semantic-subtext-small)]">
                          아직 확인하지 않았어요
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-semantic-text-secondary shrink-0 [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-subtext-medium)]">
                    {formatContributedDate(friend.contributedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
