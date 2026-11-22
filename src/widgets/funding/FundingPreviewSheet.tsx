"use client";

import OpenSheet from "@/components/OpenSheet";
import type { FundingWish } from "@/types/funding/funding";
import FundingMessage from "@/widgets/funding/FundingMessage";
import FundingProgressCard from "@/widgets/funding/FundingProgressCard";
import ProfilePink from "@/assets/icons/multicolor/profile-pink.svg?react";

// 개설 전이라 모인 금액이 없어, 진행 중인 모습을 보여주려고 고정한 값이다
const PREVIEW_PERCENT = 60;

type FundingPreviewSheetProps = {
  open: boolean;
  wish: FundingWish;
  info: { targetAmount: string; deadline: string; story?: string; pledge?: string };
  /** 줄바꿈(\n)으로 두 줄을 나눈다 */
  title: string;
  /** 서프라이즈 펀딩이면 카드의 마감일 옆에 자물쇠를 보여준다 */
  locked?: boolean;
  onClose: () => void;
  className?: string;
};

export default function FundingPreviewSheet({
  open,
  wish,
  info,
  title,
  locked = false,
  onClose,
  className,
}: FundingPreviewSheetProps) {
  return (
    <OpenSheet open={open} title="미리보기" onClose={onClose} className={className}>
      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2.5 px-4 py-1">
            <ProfilePink aria-hidden className="size-6 shrink-0" />
            <h1 className="text-semantic-text-strong min-w-0 [letter-spacing:var(--letter-spacing-default)] whitespace-pre-line [font:var(--semantic-title-a2-z-large)]">
              {title}
            </h1>
          </div>
          <FundingMessage story={info.story} pledge={info.pledge} />
        </div>
        <FundingProgressCard
          fundingId={wish.id}
          productImageUrl={wish.productImageUrl ?? ""}
          productName={wish.productName}
          deadline={info.deadline}
          percent={PREVIEW_PERCENT}
          targetAmount={Number(info.targetAmount)}
          locked={locked}
        />
      </div>
    </OpenSheet>
  );
}
