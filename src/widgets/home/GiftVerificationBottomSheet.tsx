"use client";

import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import List from "@/components/List";
import { useGiftVerificationTargetsQuery } from "@/hooks/queries/home/useGiftVerificationTargetsQuery";
import {
  formatGiftVerificationCaption,
  getReceivedProductName,
  sortByOldestDeadline,
} from "@/utils/home/giftVerificationTarget";
import HomeLoadError from "@/widgets/home/HomeLoadError";
import GiftVerificationListSkeleton from "@/widgets/home/skeleton/GiftVerificationListSkeleton";

type GiftVerificationBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  onVerify: (fundingId: number) => void;
};

export default function GiftVerificationBottomSheet({
  open,
  onClose,
  onVerify,
}: GiftVerificationBottomSheetProps) {
  const query = useGiftVerificationTargetsQuery({ enabled: open });
  const targets = query.data?.targets;

  return (
    <BottomSheet
      open={open}
      title="선물 인증"
      height="auto"
      onClose={onClose}
      // Figma 기준 목록 개수와 무관하게 582px 높이로 고정한다. 시트가 -bottom-6만큼 화면 아래로 내려가 있어 24px을 더한다(작은 화면은 auto의 max-h가 제한)
      className="h-[606px]">
      <div className="flex w-full flex-col gap-2 pb-7">
        <div className="flex w-full flex-col gap-2 pt-2 pb-5">
          <p className="text-semantic-text-strong [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-title-a2-z-large)]">
            인증할 선물{" "}
            {targets && <span className="text-semantic-text-brand">{targets.length}개</span>}
          </p>
          <p className="text-semantic-text-secondary [letter-spacing:var(--letter-spacing-default)] whitespace-pre-line [font:var(--semantic-subtext-large)]">
            {"선물을 받았다면 친구들에게 알려주세요.\n도착을 알리면 펀딩이 마무리돼요."}
          </p>
        </div>
        {targets ? (
          targets.length > 0 ? (
            <ul className="flex w-full flex-col">
              {sortByOldestDeadline(targets).map(target => (
                <li key={target.giftVerificationId}>
                  <List
                    type="product"
                    thumbnailSrc={target.productImageUrl}
                    thumbnailAlt={getReceivedProductName(target)}
                    title={getReceivedProductName(target)}
                    description={formatGiftVerificationCaption(target)}
                    right={
                      <Button size="small" onClick={() => onVerify(target.fundingId)}>
                        인증하기
                      </Button>
                    }
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-semantic-text-tertiary py-10 text-center [font:var(--semantic-subtext-large)]">
              인증할 선물을 모두 인증했어요
            </p>
          )
        ) : query.isError ? (
          <HomeLoadError
            message="인증할 선물을 불러오지 못했어요"
            onRetry={() => query.refetch()}
          />
        ) : (
          <GiftVerificationListSkeleton />
        )}
      </div>
    </BottomSheet>
  );
}
