"use client";

import CloseSheet from "@/components/CloseSheet";

type ClosedFundingSheetProps = {
  open: boolean;
  onClose: () => void;
};

export default function ClosedFundingSheet({ open, onClose }: ClosedFundingSheetProps) {
  return (
    <CloseSheet open={open} title="마감된 펀딩" closeType="back" onClose={onClose}>
      <p className="text-semantic-text-secondary flex flex-1 items-center justify-center">
        마감된 펀딩이 없어요.
      </p>
    </CloseSheet>
  );
}
