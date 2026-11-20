"use client";

import { useEffect, useId, useRef, type SyntheticEvent } from "react";

import Badge from "@/components/Badge";
import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import Profile, { getProfileColor } from "@/components/Profile";
import { cn } from "@/utils/cn";
import { formatContributedDate } from "@/utils/funding/formatContributedDate";
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
  // 펀딩 주인 팝업에서 감사카드를 아직 안 보낸 친구에게만 배지를 띄운다
  thankCardSent?: boolean;
};

type BotemPopupProps = {
  open: boolean;
  unconfirmedCount: number;
  friends: BotemPopupFriend[];
  ownerName: string;
  isClosed: boolean;
  // 펀딩(서프라이즈) 개설자가 보는 팝업이면 첫 행을 '확인 대기'로 표시한다
  isHost?: boolean;
  // 내 펀딩의 주인이 보는 팝업이면 받은 보탬 확인·메세지·감사카드만 보여주고 보태기 버튼은 없다
  isOwner?: boolean;
  messageCount?: number;
  onClose: () => void;
  onUnconfirmedClick: () => void;
  onEditClick: () => void;
  onMessageClick: () => void;
  onContributeClick: () => void;
  onThankCardClick?: (friend: BotemPopupFriend) => void;
};

export const getUnconfirmedText = ({
  count,
  ownerName,
  isHost,
  isOwner,
}: {
  count: number;
  ownerName: string;
  isHost: boolean;
  isOwner: boolean;
}) => {
  const hasUnconfirmed = count > 0;
  if (isOwner) {
    return {
      title: `확인대기 ${count}건`,
      description: hasUnconfirmed ? "통장에 들어왔는지 확인해주세요" : "통장에 전부 들어왔어요",
    };
  }
  if (isHost) {
    return {
      title: `확인 대기 ${count}건`,
      description: hasUnconfirmed ? "통장에 들어왔는지 확인해주세요" : "새로 확인할 보탬이 없어요",
    };
  }
  const ownerWithParticle = withSubjectParticle(ownerName);
  return {
    title: `내 보탬 · 미확인 ${count}개`,
    description: hasUnconfirmed
      ? `${ownerWithParticle} 못 받은거 같아요. 확인해 볼까요?`
      : `${ownerWithParticle} 전부 확인했어요`,
  };
};

export default function BotemPopup({
  open,
  unconfirmedCount,
  friends,
  ownerName,
  isClosed,
  isHost = false,
  isOwner = false,
  messageCount = 0,
  onClose,
  onUnconfirmedClick,
  onEditClick,
  onMessageClick,
  onContributeClick,
  onThankCardClick,
}: BotemPopupProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const hasUnconfirmed = unconfirmedCount > 0;
  const unconfirmedText = getUnconfirmedText({
    count: unconfirmedCount,
    ownerName,
    isHost,
    isOwner,
  });

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
      className={cn(
        "bg-semantic-background-default rounded-xxx-large backdrop:bg-semantic-background-dim m-auto w-[324px] flex-col overflow-y-auto p-0 shadow-[0_4px_16px_var(--color-semantic-shadow-weak)] outline-none open:flex",
        isOwner && "relative h-[479px] overflow-hidden",
      )}>
      <div className={cn("flex w-full flex-col", isOwner && "min-h-0 flex-1")}>
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
            title={unconfirmedText.title}
            description={unconfirmedText.description}
            // 입금을 확인하는 쪽(개설자·주인)은 0건이어도 시트를 열어 확인 완료 상태를 볼 수 있다
            onClick={hasUnconfirmed || isHost || isOwner ? onUnconfirmedClick : undefined}
          />
          {isOwner ? (
            <BotemPopupRow
              icon={<IconTerms />}
              title={`메세지 ${messageCount}건`}
              description="펀딩 완료 후 볼 수 있어요"
            />
          ) : (
            !isClosed && (
              <BotemPopupRow
                icon={<IconTerms />}
                title="내 보탬 수정하기"
                description="마감일까지 수정할 수 있어요"
                onClick={onEditClick}
              />
            )
          )}
        </div>
        <div aria-hidden className="bg-semantic-border-weak h-px w-full shrink-0" />
        <div className={cn("flex w-full flex-col px-4 pt-3", isOwner && "min-h-0 flex-1")}>
          <div className="flex h-8 shrink-0 items-center">
            <p className="text-semantic-text-tertiary [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-x-small-weak)]">
              보태준 친구들 {friends.length}명
            </p>
          </div>
          {friends.length === 0 ? (
            <p
              className={cn(
                "text-semantic-text-secondary flex items-center justify-center [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-subtext-medium)]",
                isOwner ? "flex-1 pb-[71px]" : "h-[178px]",
              )}>
              아직 보태준 친구가 없어요
            </p>
          ) : (
            <ul
              className={cn(
                "[scrollbar-width:none] overflow-y-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
                // 주인 팝업은 하단 페이드에 마지막 친구가 가리지 않도록 스크롤 끝에 여백을 둔다
                isOwner ? "min-h-0 flex-1 pb-12" : "h-[178px]",
              )}>
              {friends.map(friend => (
                <li key={friend.id} className="flex items-center gap-3 py-3">
                  <div
                    className={cn("flex min-w-0 flex-1 items-center", isOwner ? "gap-3" : "gap-2")}>
                    <Profile
                      imageUrl={friend.profileImageUrl}
                      alt=""
                      color={getProfileColor(friend.id)}
                      showIconButton={false}
                      className="size-9 shrink-0"
                    />
                    {isOwner ? (
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5 [letter-spacing:var(--letter-spacing-default)]">
                        <span className="text-semantic-text-primary truncate [font:var(--semantic-label-small)]">
                          {friend.name}
                        </span>
                        <span className="text-semantic-text-secondary truncate [font:var(--semantic-subtext-medium)]">
                          {formatContributedDate(friend.contributedAt)} 확인
                        </span>
                      </div>
                    ) : (
                      <span className="text-semantic-text-primary truncate [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-small)]">
                        {friend.name}
                      </span>
                    )}
                  </div>
                  {isOwner ? (
                    !friend.thankCardSent && (
                      <button
                        type="button"
                        aria-label={`${friend.name}에게 감사카드 보내기`}
                        onClick={() => onThankCardClick?.(friend)}
                        className="shrink-0 cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:outline-none">
                        <Badge color="brand" variant="fill" label="감사카드 보내기" />
                      </button>
                    )
                  ) : (
                    <span className="text-semantic-text-secondary shrink-0 [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-subtext-medium)]">
                      {formatContributedDate(friend.contributedAt)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        {isOwner ? (
          <div
            aria-hidden
            className="from-semantic-background-default/0 to-semantic-background-default pointer-events-none absolute inset-x-0 bottom-0 h-[71px] bg-gradient-to-b"
          />
        ) : (
          <div className="pointer-events-none relative -mt-9 flex w-full flex-col">
            <div
              aria-hidden
              className="from-semantic-background-default/0 to-semantic-background-default h-9 w-full bg-gradient-to-b"
            />
            <div className="bg-semantic-background-default pointer-events-auto flex w-full gap-2 px-4 pt-6 pb-4">
              <Button variant="weak" size="large" className="flex-1" onClick={onMessageClick}>
                메세지 보태기
              </Button>
              <Button
                size="large"
                className="flex-1"
                disabled={isClosed}
                onClick={onContributeClick}>
                보태기
              </Button>
            </div>
            <div aria-hidden className="bg-semantic-background-default h-3 w-full" />
          </div>
        )}
      </div>
    </dialog>
  );
}
