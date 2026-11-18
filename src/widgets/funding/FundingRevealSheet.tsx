"use client";

import BottomSheet from "@/components/BottomSheet";
import GiftAnimation from "@/components/effects/GiftAnimation";
import Title from "@/components/Title";

type FundingRevealSheetProps = {
  open: boolean;
  onClose: () => void;
  onReveal: () => void;
};

export default function FundingRevealSheet({ open, onClose, onReveal }: FundingRevealSheetProps) {
  return (
    <BottomSheet
      open={open}
      title="펀딩 공개"
      height="auto"
      headerType="handle"
      onClose={onClose}
      buttons={{
        leftLabel: "다음에",
        rightLabel: "팡! 열어보기",
        onLeftClick: onClose,
        onRightClick: onReveal,
      }}>
      <div className="flex w-full flex-col items-center gap-6">
        <GiftAnimation variant="open" playing={open} />
        <Title
          type="a2z"
          title="지금 열어볼까요?"
          description="친구들의 메시지를 한 번에 볼 수 있어요"
        />
      </div>
    </BottomSheet>
  );
}
