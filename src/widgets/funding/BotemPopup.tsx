"use client";

import { useEffect, useId, useRef, type SyntheticEvent } from "react";

import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import Profile, { getProfileColor } from "@/components/Profile";
import { toDateString } from "@/utils/date/dateString";
import { withSubjectParticle } from "@/utils/withSubjectParticle";
import BotemPopupRow from "@/widgets/funding/BotemPopupRow";
import IconClose from "@/assets/icons/icon-close.svg?react";
import IconNotification from "@/assets/icons/icon-notification.svg?react";
import IconTerms from "@/assets/icons/multicolor/icon-terms.svg?react";

export type BotemPopupFriend = {
  id: number;
  name: string;
  contributedAt: string;
  profileImageUrl?: string;
};

type BotemPopupProps = {
  open: boolean;
  unconfirmedCount: number;
  friends: BotemPopupFriend[];
  ownerName: string;
  isClosed: boolean;
  onClose: () => void;
  onUnconfirmedClick: () => void;
  onEditClick: () => void;
  onMessageClick: () => void;
  onContributeClick: () => void;
};

// UTC(Z)로 와도 로컬 날짜로 맞추도록 Date로 파싱하고, 파싱이 안 되는 값은 날짜를 비운다
const formatContributedDate = (contributedAt: string) => {
  const date = new Date(contributedAt);
  return Number.isNaN(date.getTime()) ? "" : toDateString(date).replaceAll("-", ".");
};

export default function BotemPopup({
  open,
  unconfirmedCount,
  friends,
  ownerName,
  isClosed,
  onClose,
  onUnconfirmedClick,
  onEditClick,
  onMessageClick,
  onContributeClick,
}: BotemPopupProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const hasUnconfirmed = unconfirmedCount > 0;
  const ownerWithParticle = withSubjectParticle(ownerName);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // ESC로 브라우저가 직접 닫으면 open prop과 어긋나므로 막고 onClose로 넘긴다
  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    onClose();
  };

  // 안쪽 래퍼가 다이얼로그 전체를 채우므로 target이 다이얼로그 자신이면 딤(backdrop) 클릭이다
  const handleDialogClick = (event: SyntheticEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      tabIndex={-1}
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClick={handleDialogClick}
      className="bg-semantic-background-default rounded-xxx-large backdrop:bg-semantic-background-dim m-auto w-[324px] flex-col overflow-hidden p-0 shadow-[0_4px_16px_var(--color-semantic-shadow-weak)] outline-none open:flex">
      <div className="flex w-full flex-col">
        <div className="flex w-full flex-col px-4 py-3">
          <div className="flex w-full items-center justify-between">
            <h2
              id={titleId}
              className="text-semantic-text-tertiary [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-x-small-weak)]">
              내 보탬
            </h2>
            <IconButton size="medium" icon={<IconClose />} aria-label="닫기" onClick={onClose} />
          </div>
          <BotemPopupRow
            highlighted={hasUnconfirmed}
            icon={
              <IconNotification
                className={
                  hasUnconfirmed ? "text-semantic-icon-danger" : "text-semantic-icon-primary"
                }
              />
            }
            title={`내 보탬 · 미확인 ${unconfirmedCount}개`}
            description={
              hasUnconfirmed
                ? `${ownerWithParticle} 못 받은거 같아요. 확인해 볼까요?`
                : `${ownerWithParticle} 전부 확인했어요`
            }
            onClick={hasUnconfirmed ? onUnconfirmedClick : undefined}
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
        <div className="flex w-full flex-col px-4 pt-3">
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
            <ul className="h-[178px] [scrollbar-width:none] overflow-y-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {friends.map(friend => (
                <li key={friend.id} className="flex items-center gap-3 py-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Profile
                      imageUrl={friend.profileImageUrl}
                      alt=""
                      color={getProfileColor(friend.id)}
                      showIconButton={false}
                      className="size-9 shrink-0"
                    />
                    <span className="text-semantic-text-primary truncate [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-small)]">
                      {friend.name}
                    </span>
                  </div>
                  <span className="text-semantic-text-secondary shrink-0 [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-subtext-medium)]">
                    {formatContributedDate(friend.contributedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="pointer-events-none relative -mt-9 flex w-full flex-col">
          <div
            aria-hidden
            className="from-semantic-background-default/0 to-semantic-background-default h-9 w-full bg-gradient-to-b"
          />
          <div className="bg-semantic-background-default pointer-events-auto flex w-full gap-2 px-4 pt-6 pb-4">
            <Button
              variant="weak"
              size="large"
              className="flex-1"
              disabled={isClosed}
              onClick={onMessageClick}>
              메세지 보태기
            </Button>
            <Button size="large" className="flex-1" disabled={isClosed} onClick={onContributeClick}>
              보태기
            </Button>
          </div>
          <div aria-hidden className="bg-semantic-background-default h-3 w-full" />
        </div>
      </div>
    </dialog>
  );
}
