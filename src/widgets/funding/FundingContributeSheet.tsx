"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Combobox, { type ComboboxChip } from "@/components/Combobox";
import OpenSheet from "@/components/OpenSheet";
import Title from "@/components/Title";
import ToastMessage from "@/components/ToastMessage";
import { cn } from "@/utils/cn";

// 시트가 이미 떠 있는 상태에서 빈 화면 → Title → 입력 영역 순서로 나타난다 (FundingInfoStep 모션 기준)
const EASE_STANDARD = [0.2, 0, 0, 1] as const;
const TITLE_TRANSITION = { delay: 0.15, duration: 0.45, ease: EASE_STANDARD };
const FIELD_TRANSITION = { delay: 0.4, duration: 0.4, ease: EASE_STANDARD };

const AMOUNT_CHIPS: ComboboxChip[] = [5000, 10000, 50000].map(amount => ({
  label: `${amount.toLocaleString("ko-KR")}원`,
  value: String(amount),
}));

// 지나치게 긴 입력이 Number 정밀도 손실·Infinity로 표시가 깨지지 않게 막는다 (초과 검증은 그대로 걸린다)
const capAmount = (value: number) => Math.min(value, Number.MAX_SAFE_INTEGER);

type FundingContributeSheetProps = {
  open: boolean;
  hostName: string;
  // 이 금액을 넘으면 다음 버튼을 막는다 (목표 금액 - 현재 모인 금액)
  maxAmount: number;
  onClose: () => void;
  onNext: (amount: number) => void;
  className?: string;
};

export default function FundingContributeSheet({
  open,
  hostName,
  maxAmount,
  onClose,
  onNext,
  className,
}: FundingContributeSheetProps) {
  const [amount, setAmount] = useState(0);
  // iOS는 키보드 열림·닫힘 이벤트가 없어 input의 focus·blur를 키보드가 올라온 시점으로 본다
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isOverMax = amount > maxAmount;

  // 시트를 닫으면 다음에 열 때 빈 입력으로 시작한다
  const handleClose = () => {
    setAmount(0);
    setIsTyping(false);
    onClose();
  };

  return (
    <OpenSheet
      open={open}
      title={`${hostName}에게 보태기`}
      onClose={handleClose}
      className={className}
      overlay={
        <ToastMessage
          show={isOverMax}
          state={false}
          text={`최대 ${maxAmount.toLocaleString("ko-KR")}원까지 보탤 수 있어요`}
          className="pointer-events-none absolute bottom-32 left-1/2 -translate-x-1/2"
        />
      }>
      <div className="flex w-full flex-col gap-4">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={TITLE_TRANSITION}
          className="w-full">
          <Title type="a2z" title="얼마를 보탤까요?" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={FIELD_TRANSITION}
          // 입력 영역이 다 나타난 뒤에 포커스해야 모션 중 키보드가 올라와 레이아웃이 흔들리지 않는다
          onAnimationComplete={() => inputRef.current?.focus({ preventScroll: true })}
          onFocus={() => setIsTyping(true)}
          onBlur={() => setIsTyping(false)}
          className="w-full">
          <Combobox
            ref={inputRef}
            label="보탬 금액"
            suffix="원"
            placeholder="입력해주세요"
            inputMode="numeric"
            enterKeyHint="done"
            autoComplete="off"
            chips={AMOUNT_CHIPS}
            chipPosition="bottom"
            value={amount ? amount.toLocaleString("ko-KR") : ""}
            onChange={event => setAmount(capAmount(Number(event.target.value.replace(/\D/g, ""))))}
            onClear={() => setAmount(0)}
            // 칩은 누를 때마다 금액을 더한다 (5,000 → 10,000 → 15,000)
            onChipSelect={chip => setAmount(prev => capAmount(prev + Number(chip.value)))}
            error={isOverMax}
          />
        </motion.div>
      </div>
      {/* 키보드가 올라온 터치 기기에서는 CTA가 키보드 위에 떠 입력을 가리므로 숨긴다 */}
      <BottomCTA className={cn(isTyping && "pointer-coarse:hidden")}>
        <Button
          color="brand"
          size="xlarge"
          disabled={amount <= 0 || isOverMax}
          onClick={() => onNext(amount)}
          className="flex-1">
          다음
        </Button>
      </BottomCTA>
    </OpenSheet>
  );
}
