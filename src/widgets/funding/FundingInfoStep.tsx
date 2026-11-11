"use client";

import { type FocusEvent, useRef, useState } from "react";
import { motion } from "framer-motion";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Combobox from "@/components/Combobox";
import InfoBox from "@/components/InfoBox";
import SelectBox from "@/components/SelectBox";
import TextArea from "@/components/TextArea";
import Title from "@/components/Title";
import type { WishResponse } from "@/types/wish/wish";
import { cn } from "@/utils/cn";
import { formatDeadline, getTodayDate } from "@/utils/funding/formatDeadline";

// 시트가 이미 떠 있는 상태에서 빈 화면 → Title → 입력 영역 순서로 나타난다 (AddWishBottomSheet 모션 기준)
const EASE_STANDARD = [0.2, 0, 0, 1] as const;
const TITLE_TRANSITION = { delay: 0.15, duration: 0.45, ease: EASE_STANDARD };
const FIELD_TRANSITION = { delay: 0.4, duration: 0.4, ease: EASE_STANDARD };
// 마감일은 이미 화면에 있는 목표 금액 입력 뒤에 나타나므로 delay를 짧게 잡는다
const DEADLINE_TITLE_TRANSITION = { ...TITLE_TRANSITION, delay: 0 };
const DEADLINE_FIELD_TRANSITION = { ...FIELD_TRANSITION, delay: 0.15 };
const STORY_FIELD_TRANSITION = { ...FIELD_TRANSITION, delay: 0.15 };
const PLEDGE_FIELD_TRANSITION = { ...FIELD_TRANSITION, delay: 0.15 };
const TEXT_AREA_MAX_LENGTH = 300;
// 하단 고정 CTA(버튼 56 + 아래 패딩 20 + 그라데이션 일부)에 마지막 필드가 가려지지 않게 비운다
const CTA_CLEARANCE_CLASS = "pb-[calc(6rem+env(safe-area-inset-bottom))]";

const TEXT_ENTRY_SELECTOR = 'textarea, input:not([type="date"])';

type Stage = "amount" | "deadline" | "story" | "pledge";

const STAGE_TITLE: Record<Stage, { title: string; description?: string }> = {
  amount: { title: "목표 금액은 얼마인가요?" },
  deadline: { title: "언제까지 모을까요?" },
  story: { title: "어떤 사연인지 들려주세요" },
  pledge: { title: "공약도 걸어볼까요?", description: "선택이에요. 없으면 건너뛰어도 돼요" },
};
// 위에 새 필드가 생겨 아래 필드가 밀려 내려갈 때는 등장 delay 없이 바로 따라 내려간다
const PUSH_DOWN_TRANSITION = { duration: 0.4, ease: EASE_STANDARD };
const BASE_PRICE_CHIP = { label: "기본 상품 가격", value: "base-price" };

type FundingInfoStepProps = {
  wish: WishResponse;
};

export default function FundingInfoStep({ wish }: FundingInfoStepProps) {
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  // 한 번 나타난 마감일은 목표 금액을 지워도 유지한다
  const [showDeadline, setShowDeadline] = useState(false);
  // 한 번 나타난 사연도 마감일을 지워도 유지한다
  const [showStory, setShowStory] = useState(false);
  const [story, setStory] = useState("");
  // 한 번 나타난 공약도 사연을 지워도 유지한다
  const [showPledge, setShowPledge] = useState(false);
  const [pledge, setPledge] = useState("");
  const stage: Stage = showPledge
    ? "pledge"
    : showStory
      ? "story"
      : showDeadline
        ? "deadline"
        : "amount";
  // iOS는 키보드 열림·닫힘 이벤트가 없어 필드의 focus·blur를 키보드가 올라온 시점으로 본다
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const storyRef = useRef<HTMLTextAreaElement>(null);
  const basePriceText = wish.price.toLocaleString("ko-KR");
  const today = getTodayDate();

  // iOS는 키보드 닫힘 이벤트가 없어 목표 금액 input의 blur(완료 버튼·바깥 탭)를 키보드가 닫힌 시점으로 본다
  const revealDeadline = () => {
    if (Number(targetAmount) > 0) setShowDeadline(true);
  };

  // 날짜 input의 blur가 버블링되어 마감일 영역에서 잡힌다
  const revealStory = () => {
    if (deadline) setShowStory(true);
  };

  // 사연 TextArea의 blur가 버블링되어 사연 영역에서 잡힌다
  const revealPledge = () => {
    if (story.trim()) setShowPledge(true);
  };

  // 공약은 선택 필드라 조건에서 제외한다
  const canSubmit = Number(targetAmount) > 0 && deadline !== "" && story.trim() !== "";

  // 날짜 input은 키보드 대신 캘린더를 열기 때문에 텍스트 입력 필드만 입력 중으로 본다
  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    setIsTyping(event.target.matches(TEXT_ENTRY_SELECTOR));
  };

  return (
    <div
      onFocus={handleFocus}
      onBlur={() => setIsTyping(false)}
      className={cn("flex w-full flex-col gap-4", showPledge && CTA_CLEARANCE_CLASS)}>
      <motion.div
        key={stage}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={showDeadline ? DEADLINE_TITLE_TRANSITION : TITLE_TRANSITION}
        className="w-full">
        <Title
          type="a2z"
          title={STAGE_TITLE[stage].title}
          description={STAGE_TITLE[stage].description}
        />
      </motion.div>
      {showPledge && (
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={PLEDGE_FIELD_TRANSITION}
          className="w-full">
          <TextArea
            label="공약"
            placeholder="입력해주세요"
            maxLength={TEXT_AREA_MAX_LENGTH}
            value={pledge}
            onChange={event => setPledge(event.target.value)}
            onClear={() => setPledge("")}
          />
        </motion.div>
      )}
      {showStory && (
        <motion.div
          layout="position"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...STORY_FIELD_TRANSITION, layout: PUSH_DOWN_TRANSITION }}
          onAnimationComplete={() => storyRef.current?.focus({ preventScroll: true })}
          onBlur={revealPledge}
          className="w-full">
          <TextArea
            ref={storyRef}
            label="사연"
            placeholder="입력해주세요"
            maxLength={TEXT_AREA_MAX_LENGTH}
            value={story}
            onChange={event => setStory(event.target.value)}
            onClear={() => setStory("")}
          />
        </motion.div>
      )}
      {showDeadline && (
        <motion.div
          layout="position"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...DEADLINE_FIELD_TRANSITION, layout: PUSH_DOWN_TRANSITION }}
          onBlur={revealStory}
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
        layout="position"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...FIELD_TRANSITION, layout: PUSH_DOWN_TRANSITION }}
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
      {showPledge && (
        // 키보드가 올라온 터치 기기에서는 CTA가 키보드 위에 떠 입력을 가리므로 모션 없이 숨긴다
        <BottomCTA className={cn(isTyping && "pointer-coarse:hidden")}>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={PLEDGE_FIELD_TRANSITION}
            className="flex">
            <Button color="brand" size="xlarge" disabled={!canSubmit} className="flex-1">
              다음
            </Button>
          </motion.div>
        </BottomCTA>
      )}
    </div>
  );
}
