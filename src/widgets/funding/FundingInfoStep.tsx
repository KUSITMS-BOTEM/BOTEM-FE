"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

import Combobox from "@/components/Combobox";
import InfoBox from "@/components/InfoBox";
import Title from "@/components/Title";
import type { WishResponse } from "@/types/wish/wish";

// 시트가 이미 떠 있는 상태에서 빈 화면 → Title → 입력 영역 순서로 나타난다 (AddWishBottomSheet 모션 기준)
const EASE_STANDARD = [0.2, 0, 0, 1] as const;
const TITLE_TRANSITION = { delay: 0.15, duration: 0.45, ease: EASE_STANDARD };
const FIELD_TRANSITION = { delay: 0.4, duration: 0.4, ease: EASE_STANDARD };
const BASE_PRICE_CHIP = { label: "기본 상품 가격", value: "base-price" };

type FundingInfoStepProps = {
  wish: WishResponse;
};

export default function FundingInfoStep({ wish }: FundingInfoStepProps) {
  const [targetAmount, setTargetAmount] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const basePriceText = wish.price.toLocaleString("ko-KR");

  return (
    <div className="flex w-full flex-col gap-4">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={TITLE_TRANSITION}
        className="w-full">
        <Title type="a2z" title="목표 금액은 얼마인가요?" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={FIELD_TRANSITION}
        // 입력 영역이 다 나타난 뒤에 포커스해야 모션 중 키보드가 올라와 레이아웃이 흔들리지 않는다
        onAnimationComplete={() => inputRef.current?.focus({ preventScroll: true })}
        className="flex w-full flex-col gap-2">
        <Combobox
          ref={inputRef}
          label="목표 금액"
          suffix="원"
          inputMode="numeric"
          autoComplete="off"
          chips={[BASE_PRICE_CHIP]}
          onChipSelect={() => setTargetAmount(String(wish.price))}
          value={targetAmount ? Number(targetAmount).toLocaleString("ko-KR") : ""}
          onChange={event => setTargetAmount(event.target.value.replace(/\D/g, ""))}
        />
        <InfoBox text={`기본 상품 가격은 ${basePriceText}원이에요`} />
      </motion.div>
    </div>
  );
}
