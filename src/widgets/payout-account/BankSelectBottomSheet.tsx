"use client";

import BottomSheet from "@/components/BottomSheet";
import BankSelectBox from "@/components/BankSelectBox";
import { BANKS, type BankCode } from "@/constants/bank";

type BankSelectBottomSheetProps = {
  open: boolean;
  selectedBank: BankCode | null;
  onSelectBank: (code: BankCode) => void;
  onClose: () => void;
  className?: string;
};

export default function BankSelectBottomSheet({
  open,
  selectedBank,
  onSelectBank,
  onClose,
  className,
}: BankSelectBottomSheetProps) {
  return (
    <BottomSheet open={open} title="" height="max" onClose={onClose} className={className}>
      <p className="text-semantic-text-strong w-full pt-2 pb-5 [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-title-a2-z-large)]">
        은행을 선택해주세요
      </p>
      <div className="grid w-full grid-cols-3 gap-2">
        {BANKS.map(bank => (
          <BankSelectBox
            key={bank.code}
            selected={selectedBank === bank.code}
            text={bank.name}
            image={bank.logo}
            onClick={() => onSelectBank(bank.code)}
          />
        ))}
      </div>
    </BottomSheet>
  );
}
