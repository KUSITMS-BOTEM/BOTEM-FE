"use client";

import { type FocusEvent, useRef, useState } from "react";
import { motion } from "framer-motion";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Chip from "@/components/Chip";
import Combobox from "@/components/Combobox";
import InfoBox from "@/components/InfoBox";
import SelectBox from "@/components/SelectBox";
import Title from "@/components/Title";
import type { FundingWish } from "@/types/funding/funding";
import { cn } from "@/utils/cn";
import { addDays } from "@/utils/funding/addDays";
import { formatDeadline, getTodayDate } from "@/utils/funding/formatDeadline";
import { getBirthdayReveal } from "@/utils/funding/getBirthdayReveal";
import { formatBirthdayDisplay } from "@/utils/user/formatBirthdayDisplay";

const EASE_STANDARD = [0.2, 0, 0, 1] as const;
const TITLE_TRANSITION = { delay: 0.15, duration: 0.45, ease: EASE_STANDARD };
const FIELD_TRANSITION = { delay: 0.4, duration: 0.4, ease: EASE_STANDARD };
// 마감일·공개일은 이미 화면에 있는 입력 뒤에 나타나므로 delay를 짧게 잡는다
const DEADLINE_TITLE_TRANSITION = { ...TITLE_TRANSITION, delay: 0 };
const NEXT_FIELD_TRANSITION = { ...FIELD_TRANSITION, delay: 0.15 };
// 위에 새 필드가 생겨 아래 필드가 밀려 내려갈 때는 등장 delay 없이 바로 따라 내려간다
const PUSH_DOWN_TRANSITION = { duration: 0.4, ease: EASE_STANDARD };
// 하단 고정 CTA에 마지막 필드가 가려지지 않게 비운다
const CTA_CLEARANCE_CLASS = "pb-[calc(6rem+env(safe-area-inset-bottom))]";
const TEXT_ENTRY_SELECTOR = 'textarea, input:not([type="date"])';
const BASE_PRICE_CHIP = { label: "기본 상품 가격", value: "base-price" };

type Stage = "amount" | "deadline" | "reveal";

export type SurpriseInfoValues = {
  targetAmount: string;
  deadline: string;
  // "YYYY-MM-DD". 공개 시간은 밤 12시로 고정이라 날짜만 받는다
  revealDate: string;
};

type SurpriseInfoStepProps = {
  wish: FundingWish;
  recipientName: string;
  // 받는 사람의 생일("MM-dd")과 다음 생일까지 남은 일수. 둘 다 있어야 "생일 사용" 칩을 보여준다
  recipientBirthday?: string | null;
  recipientBirthdayDday?: number | null;
  onNext: (values: SurpriseInfoValues) => void;
  // 있으면 수정 모드: 모든 필드를 채워 보여주고, 값이 바뀌어야 CTA가 활성화된다
  initialValues?: SurpriseInfoValues;
  // 수정 모드 없이 값만 미리 채운다. 수정 시트에서 바꾼 값을 숨겨 둔 입력 단계에 반영할 때 쓴다
  defaultValues?: SurpriseInfoValues;
  submitLabel?: string;
};

export default function SurpriseInfoStep({
  wish,
  recipientName,
  recipientBirthday,
  recipientBirthdayDday,
  onNext,
  initialValues,
  defaultValues,
  submitLabel = "다음",
}: SurpriseInfoStepProps) {
  const seed = initialValues ?? defaultValues;
  // 값이 미리 채워진 채로 시작하면 모든 필드를 모션·자동 포커스 없이 바로 보여준다
  const isEdit = seed !== undefined;
  const [targetAmount, setTargetAmount] = useState(seed?.targetAmount ?? "");
  const [deadline, setDeadline] = useState(seed?.deadline ?? "");
  const [revealDate, setRevealDate] = useState(seed?.revealDate ?? "");
  // 한 번 나타난 마감일은 목표 금액을 지워도 유지한다
  const [showDeadline, setShowDeadline] = useState(isEdit);
  // 한 번 나타난 공개일도 마감일을 지워도 유지한다
  const [showReveal, setShowReveal] = useState(isEdit);
  const stage: Stage = showReveal ? "reveal" : showDeadline ? "deadline" : "amount";
  // iOS는 키보드 열림·닫힘 이벤트가 없어 필드의 focus·blur를 키보드가 올라온 시점으로 본다
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const basePriceText = wish.price.toLocaleString("ko-KR");
  const today = getTodayDate();
  // 백엔드는 공개 시각을 마감일 다음 날 안에서만 허용하고 공개 시간이 자정이라 고를 수 있는 날짜는 하루뿐이다
  const allowedRevealDate = deadline ? addDays(deadline, 1) : undefined;
  const { revealDate: birthdayRevealDate, canUse: canUseBirthday } = getBirthdayReveal(
    today,
    recipientBirthday,
    recipientBirthdayDday,
  );

  const revealDeadline = () => {
    if (Number(targetAmount) > 0) setShowDeadline(true);
  };

  const handleDeadlineChange = (date: string) => {
    const next = date >= today ? date : "";
    setDeadline(next);
    // 달력·휠 시트는 blur 없이 닫히므로 날짜를 확정하는 즉시 공개일을 연다
    if (next) setShowReveal(true);
    // 마감일이 바뀌어 기존 공개일이 허용 범위를 벗어나면 비운다
    if (revealDate !== (next ? addDays(next, 1) : "")) setRevealDate("");
  };

  const isChanged =
    !initialValues ||
    targetAmount !== initialValues.targetAmount ||
    deadline !== initialValues.deadline ||
    revealDate !== initialValues.revealDate;
  // 날짜 선택 뒤 자정이 지나 마감일이 과거가 될 수 있어 제출 가능 여부도 오늘 기준으로 다시 본다
  const canSubmit =
    Number(targetAmount) > 0 &&
    deadline !== "" &&
    deadline >= today &&
    revealDate !== "" &&
    isChanged;
  const showCta = revealDate !== "";

  // 수정 모드에서는 시트가 열리자마자 키보드가 올라오지 않게 자동 포커스를 하지 않는다
  const focusIfCreating = (element: HTMLElement | null) => {
    if (!isEdit) element?.focus({ preventScroll: true });
  };

  // 날짜 input은 키보드 대신 캘린더를 열기 때문에 텍스트 입력 필드만 입력 중으로 본다
  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    setIsTyping(event.target.matches(TEXT_ENTRY_SELECTOR));
  };

  const titles: Record<Stage, string> = {
    amount: "목표 금액은 얼마인가요?",
    deadline: "언제까지 모을까요?",
    reveal: `${recipientName}에게\n언제 공개할까요?`,
  };

  return (
    <div
      onFocus={handleFocus}
      onBlur={() => setIsTyping(false)}
      className={cn("flex w-full flex-col gap-4", showCta && CTA_CLEARANCE_CLASS)}>
      <motion.div
        key={stage}
        initial={isEdit ? false : { opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={showDeadline ? DEADLINE_TITLE_TRANSITION : TITLE_TRANSITION}
        className="w-full">
        <Title type="a2z" title={titles[stage]} />
      </motion.div>
      {showReveal && (
        <motion.div
          layout="position"
          initial={isEdit ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...NEXT_FIELD_TRANSITION, layout: PUSH_DOWN_TRANSITION }}
          className="flex w-full flex-col gap-3">
          {birthdayRevealDate && recipientBirthday && (
            <div className="flex w-full">
              <Chip
                label={`생일 ${formatBirthdayDisplay(recipientBirthday)} 사용`}
                selected={revealDate === birthdayRevealDate}
                disabled={!canUseBirthday}
                onClick={() => {
                  // 백엔드는 공개일을 마감일 다음 날로만 허용하므로 마감일을 생일 전날로 함께 맞춘다
                  setDeadline(addDays(birthdayRevealDate, -1));
                  setRevealDate(birthdayRevealDate);
                }}
              />
            </div>
          )}
          <SelectBox
            variant="deadline"
            label="펀딩 공개일"
            value={formatDeadline(revealDate)}
            dateValue={revealDate}
            minDate={allowedRevealDate}
            maxDate={allowedRevealDate}
            pickerTitle="펀딩 공개일 선택"
            helperText="공개 시간은 밤 12시예요"
            onDeadlineChange={date => setRevealDate(date === allowedRevealDate ? date : "")}
          />
        </motion.div>
      )}
      {showDeadline && (
        <motion.div
          layout="position"
          initial={isEdit ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...NEXT_FIELD_TRANSITION, layout: PUSH_DOWN_TRANSITION }}
          className="w-full">
          <SelectBox
            variant="deadline"
            label="마감일"
            value={formatDeadline(deadline)}
            dateValue={deadline}
            minDate={today}
            onDeadlineChange={handleDeadlineChange}
          />
        </motion.div>
      )}
      <motion.div
        layout="position"
        initial={isEdit ? false : { opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...FIELD_TRANSITION, layout: PUSH_DOWN_TRANSITION }}
        // 입력 영역이 다 나타난 뒤에 포커스해야 모션 중 키보드가 올라와 레이아웃이 흔들리지 않는다
        onAnimationComplete={() => focusIfCreating(inputRef.current)}
        className="flex w-full flex-col gap-2">
        <Combobox
          ref={inputRef}
          label="목표 금액"
          suffix="원"
          inputMode="numeric"
          enterKeyHint="done"
          autoComplete="off"
          chips={showDeadline ? undefined : [BASE_PRICE_CHIP]}
          onChipSelect={() => {
            setTargetAmount(String(wish.price));
            // 칩 클릭은 input blur를 일으키지 않으므로 마감일 단계를 직접 연다
            if (wish.price > 0) setShowDeadline(true);
          }}
          value={targetAmount ? Number(targetAmount).toLocaleString("ko-KR") : ""}
          onChange={event => setTargetAmount(event.target.value.replace(/\D/g, ""))}
          onBlur={revealDeadline}
          onKeyDown={event => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
        />
        {!showDeadline && <InfoBox text={`기본 상품 가격은 ${basePriceText}원이에요`} />}
      </motion.div>
      {showCta && (
        // 키보드가 올라온 터치 기기에서는 CTA가 키보드 위에 떠 입력을 가리므로 모션 없이 숨긴다
        <BottomCTA className={cn(isTyping && "pointer-coarse:hidden")}>
          <motion.div
            initial={isEdit ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={NEXT_FIELD_TRANSITION}
            className="flex">
            <Button
              color="brand"
              size="xlarge"
              disabled={!canSubmit}
              onClick={() => {
                if (deadline >= getTodayDate()) onNext({ targetAmount, deadline, revealDate });
              }}
              className="flex-1">
              {submitLabel}
            </Button>
          </motion.div>
        </BottomCTA>
      )}
    </div>
  );
}
