"use client";

import { type FocusEvent, useState } from "react";
import { motion } from "framer-motion";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Chip from "@/components/Chip";
import SelectBox from "@/components/SelectBox";
import Title from "@/components/Title";
import { cn } from "@/utils/cn";
import { addDays } from "@/utils/funding/addDays";
import { formatDeadline, getTodayDate } from "@/utils/funding/formatDeadline";
import { getBirthdayReveal } from "@/utils/funding/getBirthdayReveal";
import { getRevealDateRange } from "@/utils/funding/getRevealDateRange";
import { formatBirthdayDisplay } from "@/utils/user/formatBirthdayDisplay";
import {
  CTA_CLEARANCE_CLASS,
  FIELD_TRANSITION,
  FOLLOW_FIELD_TRANSITION,
  FOLLOW_TITLE_TRANSITION,
  PUSH_DOWN_TRANSITION,
  TITLE_TRANSITION,
} from "@/widgets/funding/fundingStepMotion";

const TEXT_ENTRY_SELECTOR = 'textarea, input:not([type="date"])';

type Stage = "deadline" | "reveal";

export type SurpriseInfoValues = {
  deadline: string;
  // "YYYY-MM-DD". 공개 시간은 밤 12시로 고정이라 날짜만 받는다
  revealDate: string;
};

type SurpriseInfoStepProps = {
  recipientName: string;
  // 받는 사람의 생일("MM-dd")과 다음 생일까지 남은 일수. 둘 다 있어야 "생일 사용" 칩을 보여준다
  recipientBirthday?: string | null;
  recipientBirthdayDday?: number | null;
  onNext: (values: SurpriseInfoValues) => void;
  // 있으면 수정 모드: 모든 필드를 채워 보여주고, 값이 바뀌어야 CTA가 활성화된다
  initialValues?: SurpriseInfoValues;
  // 수정 모드 없이 값만 미리 채운다. 수정 시트에서 바꾼 값을 숨겨 둔 입력 단계에 반영할 때 쓴다
  defaultValues?: SurpriseInfoValues;
  // 있으면 CTA에 이전 버튼을 둔다
  onPrev?: () => void;
  submitLabel?: string;
};

export default function SurpriseInfoStep({
  recipientName,
  recipientBirthday,
  recipientBirthdayDday,
  onNext,
  initialValues,
  defaultValues,
  onPrev,
  submitLabel = "다음",
}: SurpriseInfoStepProps) {
  const seed = initialValues ?? defaultValues;
  // 값이 미리 채워진 채로 시작하면 모든 필드를 모션·자동 포커스 없이 바로 보여준다
  const isEdit = seed !== undefined;
  const [deadline, setDeadline] = useState(seed?.deadline ?? "");
  const [revealDate, setRevealDate] = useState(seed?.revealDate ?? "");
  // 한 번 나타난 공개일도 마감일을 지워도 유지한다
  const [showReveal, setShowReveal] = useState(isEdit);
  const stage: Stage = showReveal ? "reveal" : "deadline";
  // iOS는 키보드 열림·닫힘 이벤트가 없어 필드의 focus·blur를 키보드가 올라온 시점으로 본다
  const [isTyping, setIsTyping] = useState(false);
  const today = getTodayDate();
  const minDeadline = addDays(today, 1);
  const revealRange = deadline ? getRevealDateRange(deadline) : undefined;
  const isInRevealRange = (date: string, range = revealRange) =>
    range !== undefined && date >= range.minDate && date <= range.maxDate;
  const { revealDate: birthdayRevealDate, canUse: canUseBirthday } = getBirthdayReveal(
    today,
    recipientBirthday,
    recipientBirthdayDday,
  );

  const handleDeadlineChange = (date: string) => {
    const next = date >= minDeadline ? date : "";
    setDeadline(next);
    // 달력·휠 시트는 blur 없이 닫히므로 날짜를 확정하는 즉시 공개일을 연다
    if (next) setShowReveal(true);
    // 마감일이 바뀌어 기존 공개일이 허용 범위를 벗어나면 비운다
    if (!isInRevealRange(revealDate, next ? getRevealDateRange(next) : undefined))
      setRevealDate("");
  };

  const isChanged =
    !initialValues ||
    deadline !== initialValues.deadline ||
    revealDate !== initialValues.revealDate;
  // 날짜 선택 뒤 자정이 지나 마감일이 과거가 될 수 있어 제출 가능 여부도 오늘 기준으로 다시 본다
  const canSubmit = deadline !== "" && deadline >= minDeadline && revealDate !== "" && isChanged;
  const showCta = revealDate !== "";

  // 날짜 input은 키보드 대신 캘린더를 열기 때문에 텍스트 입력 필드만 입력 중으로 본다
  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    setIsTyping(event.target.matches(TEXT_ENTRY_SELECTOR));
  };

  const titles: Record<Stage, string> = {
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
        transition={showReveal ? FOLLOW_TITLE_TRANSITION : TITLE_TRANSITION}
        className="w-full">
        <Title type="a2z" title={titles[stage]} />
      </motion.div>
      {showReveal && (
        <motion.div
          layout="position"
          initial={isEdit ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...FOLLOW_FIELD_TRANSITION, layout: PUSH_DOWN_TRANSITION }}
          className="flex w-full flex-col gap-3">
          {birthdayRevealDate && recipientBirthday && (
            <div className="flex w-full">
              <Chip
                label={`생일 ${formatBirthdayDisplay(recipientBirthday)} 사용`}
                selected={revealDate === birthdayRevealDate}
                disabled={!canUseBirthday}
                onClick={() => {
                  // 생일 하루 전까지 모으고 생일 자정에 공개하도록 마감일을 생일 전날로 함께 맞춘다
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
            minDate={revealRange?.minDate}
            maxDate={revealRange?.maxDate}
            pickerTitle="펀딩 공개일 선택"
            helperText="공개 시간은 밤 12시예요"
            onDeadlineChange={date => setRevealDate(isInRevealRange(date) ? date : "")}
          />
        </motion.div>
      )}
      <motion.div
        layout="position"
        initial={isEdit ? false : { opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...FIELD_TRANSITION, layout: PUSH_DOWN_TRANSITION }}
        className="w-full">
        <SelectBox
          variant="deadline"
          label="마감일"
          value={formatDeadline(deadline)}
          dateValue={deadline}
          minDate={minDeadline}
          onDeadlineChange={handleDeadlineChange}
        />
      </motion.div>
      {showCta && (
        // 키보드가 올라온 터치 기기에서는 CTA가 키보드 위에 떠 입력을 가리므로 모션 없이 숨긴다
        <BottomCTA className={cn(isTyping && "pointer-coarse:hidden")}>
          <motion.div
            initial={isEdit ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={FOLLOW_FIELD_TRANSITION}
            className="flex gap-2">
            {onPrev && (
              <Button
                color="neutral"
                variant="weak"
                size="xlarge"
                onClick={onPrev}
                className="min-w-24 flex-1">
                이전
              </Button>
            )}
            <Button
              color="brand"
              size="xlarge"
              disabled={!canSubmit}
              onClick={() => {
                if (deadline >= addDays(getTodayDate(), 1)) onNext({ deadline, revealDate });
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
