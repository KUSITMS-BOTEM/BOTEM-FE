"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

import Combobox from "@/components/Combobox";
import InfoBox from "@/components/InfoBox";
import SelectBox from "@/components/SelectBox";
import Title from "@/components/Title";
import type { WishResponse } from "@/types/wish/wish";
import { formatDeadline, getTodayDate } from "@/utils/funding/formatDeadline";

// 시트가 이미 떠 있는 상태에서 빈 화면 → Title → 입력 영역 순서로 나타난다 (AddWishBottomSheet 모션 기준)
const EASE_STANDARD = [0.2, 0, 0, 1] as const;
const TITLE_TRANSITION = { delay: 0.15, duration: 0.45, ease: EASE_STANDARD };
const FIELD_TRANSITION = { delay: 0.4, duration: 0.4, ease: EASE_STANDARD };
// 마감일은 이미 화면에 있는 목표 금액 입력 뒤에 나타나므로 delay를 짧게 잡는다
const DEADLINE_TITLE_TRANSITION = { ...TITLE_TRANSITION, delay: 0 };
const DEADLINE_FIELD_TRANSITION = { ...FIELD_TRANSITION, delay: 0.15 };
const BASE_PRICE_CHIP = { label: "기본 상품 가격", value: "base-price" };

type FundingInfoStepProps = {
  wish: WishResponse;
};

export default function FundingInfoStep({ wish }: FundingInfoStepProps) {
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  // 한 번 나타난 마감일은 목표 금액을 지워도 유지한다
  const [showDeadline, setShowDeadline] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const basePriceText = wish.price.toLocaleString("ko-KR");
  const today = getTodayDate();

  // iOS는 키보드 닫힘 이벤트가 없어 목표 금액 input의 blur(완료 버튼·바깥 탭)를 키보드가 닫힌 시점으로 본다
  const revealDeadline = () => {
    if (Number(targetAmount) > 0) setShowDeadline(true);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <motion.div
        key={showDeadline ? "deadline" : "amount"}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={showDeadline ? DEADLINE_TITLE_TRANSITION : TITLE_TRANSITION}
        className="w-full">
        <Title type="a2z" title={showDeadline ? "언제까지 모을까요?" : "목표 금액은 얼마인가요?"} />
      </motion.div>
      {showDeadline && (
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={DEADLINE_FIELD_TRANSITION}
          className="w-full">
          <SelectBox
            variant="deadline"
            label="마감일"
            value={formatDeadline(deadline)}
            minDate={today}
            // 데스크탑에서 날짜를 직접 입력하면 min을 우회할 수 있어 한 번 더 거른다
            onDeadlineChange={date => setDeadline(date >= today ? date : "")}
          />
        </motion.div>
      )}
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
          enterKeyHint="done"
          autoComplete="off"
          chips={showDeadline ? undefined : [BASE_PRICE_CHIP]}
          onChipSelect={() => setTargetAmount(String(wish.price))}
          value={targetAmount ? Number(targetAmount).toLocaleString("ko-KR") : ""}
          onChange={event => setTargetAmount(event.target.value.replace(/\D/g, ""))}
          onBlur={revealDeadline}
          onKeyDown={event => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
        />
        {!showDeadline && <InfoBox text={`기본 상품 가격은 ${basePriceText}원이에요`} />}
      </motion.div>
    </div>
  );
}
