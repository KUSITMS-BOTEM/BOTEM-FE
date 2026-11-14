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
        rightLabel: "펀딩 열기",
        onLeftClick: onClose,
        onRightClick: onReveal,
      }}>
      <div className="flex w-full flex-col items-center gap-6">
        <GiftAnimation variant="open" playing={open} />
        <Title
          type="a2z"
          title="펀딩을 공개할까요?"
          description={"펀딩을 공개하면\n편지를 한 번에 볼 수 있어요."}
        />
      </div>
    </BottomSheet>
  );
}
