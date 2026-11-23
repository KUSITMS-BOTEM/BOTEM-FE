"use client";

import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import Profile, { getProfileColor } from "@/components/Profile";
import ToastMessage from "@/components/ToastMessage";
import { useFundingManagementQuery } from "@/hooks/queries/funding/useFundingManagementQuery";
import { useShareLink } from "@/hooks/useShareLink";
import { formatDepositDate } from "@/utils/funding/depositConfirm";
import { toOwnerFundingView } from "@/utils/funding/toOwnerFundingView";
import GiftVerifyFriendListSkeleton from "@/widgets/funding/skeleton/GiftVerifyFriendListSkeleton";

type GiftVerifyShareSheetProps = {
  open: boolean;
  fundingId: number;
  // 공유 키를 받아 왔으면 넘긴다. 닫은 뒤 이동할 인증 결과 화면 주소를 만든다
  onClose: (shareKey?: string) => void;
};

export default function GiftVerifyShareSheet({
  open,
  fundingId,
  onClose,
}: GiftVerifyShareSheetProps) {
  const query = useFundingManagementQuery(fundingId, { enabled: open });
  const { toast, share } = useShareLink();
  const friends = query.data ? toOwnerFundingView(query.data).friends : undefined;
  const shareKey = query.data?.shareKey;

  const handleShare = () => {
    if (!shareKey) return;
    share({
      title: "선물 도착 인증이 왔어요",
      url: `${window.location.origin}/share/${shareKey}/gift`,
    });
  };

  return (
    <BottomSheet
      open={open}
      title="공유하기"
      height="auto"
      onClose={() => onClose(shareKey)}
      showButtonFade={false}
      toast={
        <ToastMessage
          show={toast !== null}
          state={toast === "success"}
          text={toast === "fail" ? "링크를 복사하지 못했어요" : "링크를 복사했어요"}
        />
      }
      buttons={{
        rightLabel: "친구에게 공유하기",
        rightDisabled: !shareKey,
        onRightClick: handleShare,
      }}>
      <div className="flex w-full flex-col">
        <div className="flex w-full flex-col gap-2 pt-2 pb-5">
          <p className="text-semantic-text-strong [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-title-a2-z-large)]">
            함께한 친구{friends && ` ${friends.length}명`}
          </p>
          <p className="text-semantic-text-secondary [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-subtext-large)]">
            한 명씩 도착 인증을 보내볼까요?
          </p>
        </div>
        {friends ? (
          friends.length > 0 ? (
            <ul className="flex w-full flex-col">
              {friends.map(friend => (
                <li key={friend.id} className="flex items-center gap-3 py-3">
                  <Profile
                    imageUrl={friend.profileImageUrl}
                    alt=""
                    color={getProfileColor(friend.id)}
                    showIconButton={false}
                    className="size-9 shrink-0"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 [letter-spacing:var(--letter-spacing-default)]">
                    <span className="text-semantic-text-primary truncate [font:var(--semantic-label-small)]">
                      {friend.name}
                    </span>
                    <span className="text-semantic-text-secondary truncate [font:var(--semantic-subtext-medium)]">
                      {formatDepositDate(friend.contributedAt)} 보탬
                    </span>
                  </div>
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
