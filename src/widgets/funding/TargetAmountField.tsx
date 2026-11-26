"use client";

import { type Ref, useEffect, useState } from "react";

import Combobox from "@/components/Combobox";
import ToastMessage from "@/components/ToastMessage";

const BASE_PRICE_CHIP = { label: "기본 상품 가격", value: "base-price" };
const TOAST_DURATION_MS = 2500;

type TargetAmountFieldProps = {
  ref?: Ref<HTMLInputElement>;
  // 0이면 상한 없이 입력한 값을 그대로 받는다
  price: number;
  // 쉼표 없는 숫자 문자열
  value: string;
  showPriceChip: boolean;
  onChange: (digits: string) => void;
  onPriceChipSelect: () => void;
  onBlur: () => void;
};

export default function TargetAmountField({
  ref,
  price,
  value,
  showPriceChip,
  onChange,
  onPriceChipSelect,
  onBlur,
}: TargetAmountFieldProps) {
  const [toastShown, setToastShown] = useState(false);

  useEffect(() => {
    if (!toastShown) return;
    const timer = setTimeout(() => setToastShown(false), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toastShown]);

  return (
    <div className="relative w-full">
      <Combobox
        ref={ref}
        label="목표 금액"
        suffix="원"
        inputMode="numeric"
        enterKeyHint="done"
        autoComplete="off"
        chips={showPriceChip ? [BASE_PRICE_CHIP] : undefined}
        onChipSelect={onPriceChipSelect}
        value={value ? Number(value).toLocaleString("ko-KR") : ""}
        onChange={event => {
          const digits = event.target.value.replace(/\D/g, "");
          // 상품 가격보다 큰 목표 금액은 받을 수 없어 가격으로 맞춘다
          const isOverPrice = price > 0 && Number(digits) > price;
          if (isOverPrice) setToastShown(true);
          onChange(isOverPrice ? String(price) : digits);
        }}
        onBlur={onBlur}
        onKeyDown={event => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
      <ToastMessage
        show={toastShown}
        state={false}
        text={`최대 ${price.toLocaleString("ko-KR")}원까지 설정할 수 있어요`}
        className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 whitespace-nowrap"
      />
    </div>
  );
}
