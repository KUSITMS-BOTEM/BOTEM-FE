"use client";

import { useState } from "react";

import OpenSheet from "@/components/OpenSheet";
import type { WishResponse } from "@/types/wish/wish";
import FundingInfoStep from "@/widgets/funding/FundingInfoStep";
import FundingWishSelectStep from "@/widgets/funding/FundingWishSelectStep";

type FundingOpenSheetProps = {
  open: boolean;
  onClose: () => void;
  className?: string;
};

export default function FundingOpenSheet({ open, onClose, className }: FundingOpenSheetProps) {
  const [selectedWish, setSelectedWish] = useState<WishResponse | null>(null);

  // 시트를 닫으면 다음에 열 때 위시 선택부터 다시 시작한다
  const handleClose = () => {
    setSelectedWish(null);
    onClose();
  };

  return (
    <OpenSheet
      open={open}
      title={selectedWish ? "펀딩 정보" : "펀딩 열기"}
      onClose={handleClose}
      className={className}>
      {selectedWish ? (
        <FundingInfoStep wish={selectedWish} />
      ) : (
        <FundingWishSelectStep onSelect={setSelectedWish} />
      )}
    </OpenSheet>
  );
}
