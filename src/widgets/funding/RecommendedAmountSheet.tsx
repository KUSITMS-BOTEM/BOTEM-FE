"use client";

import { useState } from "react";

import BottomSheet from "@/components/BottomSheet";
import Combobox from "@/components/Combobox";
import {
  countFunders,
  formatPerPerson,
  toRecommendedAmountOptions,
} from "@/utils/funding/recommendedAmount";
import AmountOptionRadio from "@/widgets/funding/AmountOptionRadio";

const CUSTOM = "custom";
const RADIO_NAME = "recommended-amount";

type RecommendedAmountSheetProps = {
  open: boolean;
  targetAmount: number;
  // 확정돼 있는 추천 금액. 시트를 열 때 선택 상태로 복원한다. 없으면 빈 문자열
  value: string;
  onSelect: (amount: string) => void;
  onClose: () => void;
};

export default function RecommendedAmountSheet({
  open,
  targetAmount,
  value,
  onSelect,
  onClose,
}: RecommendedAmountSheetProps) {
  const options = toRecommendedAmountOptions(targetAmount);
  const restore = () => {
    const matched = options.some(option => String(option.amount) === value);
    return { choice: matched ? value : value ? CUSTOM : null, custom: matched ? "" : value };
  };

  const [choice, setChoice] = useState<string | null>(() => restore().choice);
  const [custom, setCustom] = useState(() => restore().custom);
  const [prevOpen, setPrevOpen] = useState(open);
  // 닫은 채 고르다 만 상태가 남지 않도록 열 때마다 확정값 기준으로 되돌린다
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      const restored = restore();
      setChoice(restored.choice);
      setCustom(restored.custom);
    }
  }

  const customAmount = Number(custom);
  const isCustomOverTarget = customAmount > targetAmount;
  const isCustomValid = customAmount >= 1 && !isCustomOverTarget;
  const selectedAmount = choice === CUSTOM ? (isCustomValid ? customAmount : null) : Number(choice);
  const canSelect = choice !== null && selectedAmount !== null;

  return (
    <BottomSheet
      open={open}
      title="추천 금액"
      height="auto"
      buttons={{
        rightLabel: "선택하기",
        rightColor: "neutral",
        rightVariant: "fill",
        rightDisabled: !canSelect,
        onRightClick: () => selectedAmount && onSelect(String(selectedAmount)),
      }}
      onClose={onClose}>
      <fieldset className="flex w-full flex-col gap-4">
        <legend className="sr-only">한 명당 추천 금액</legend>
        {options.map(({ amount, headcount }) => (
          <AmountOptionRadio
            key={amount}
            name={RADIO_NAME}
            checked={choice === String(amount)}
            onChange={() => setChoice(String(amount))}
            title={formatPerPerson(amount)}
            description={`약 ${headcount}명이 보태면 다 모여요`}
          />
        ))}
        <div className="flex w-full flex-col gap-3">
          <AmountOptionRadio
            name={RADIO_NAME}
            checked={choice === CUSTOM}
            onChange={() => setChoice(CUSTOM)}
            title="직접 정할게요"
            description="원하는 금액을 입력해요"
          />
          {choice === CUSTOM && (
            <Combobox
              label="한 명당 금액"
              suffix="원"
              inputMode="numeric"
              enterKeyHint="done"
              autoComplete="off"
              autoFocus
              error={isCustomOverTarget}
              value={custom ? customAmount.toLocaleString("ko-KR") : ""}
              onChange={event => setCustom(event.target.value.replace(/\D/g, ""))}
              helperText={
                isCustomOverTarget
                  ? "목표 금액 이하로 입력해주세요"
                  : isCustomValid
                    ? `${customAmount.toLocaleString("ko-KR")}원씩 약 ${countFunders(targetAmount, customAmount)}명이 보태면 다 모여요`
                    : undefined
              }
            />
          )}
        </div>
      </fieldset>
    </BottomSheet>
  );
}
