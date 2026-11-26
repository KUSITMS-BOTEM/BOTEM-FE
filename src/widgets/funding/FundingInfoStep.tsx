"use client";

import { type FocusEvent, useRef, useState } from "react";
import { motion } from "framer-motion";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import SelectBox from "@/components/SelectBox";
import TextArea from "@/components/TextArea";
import Title from "@/components/Title";
import { cn } from "@/utils/cn";
import { addDays } from "@/utils/funding/addDays";
import { formatDeadline, getTodayDate } from "@/utils/funding/formatDeadline";
import {
  CTA_CLEARANCE_CLASS,
  FIELD_TRANSITION,
  FOLLOW_FIELD_TRANSITION,
  FOLLOW_TITLE_TRANSITION,
  PUSH_DOWN_TRANSITION,
  TITLE_TRANSITION,
} from "@/widgets/funding/fundingStepMotion";

const TEXT_AREA_MAX_LENGTH = 300;

const TEXT_ENTRY_SELECTOR = 'textarea, input:not([type="date"])';

type Stage = "deadline" | "story" | "pledge";

const STAGE_TITLE: Record<Stage, { title: string; description?: string }> = {
  deadline: { title: "언제까지 모을까요?" },
  story: { title: "어떤 사연인지 들려주세요" },
  pledge: { title: "공약도 걸어볼까요?", description: "선택이에요. 없으면 건너뛰어도 돼요" },
};

export type FundingInfoValues = {
  deadline: string;
  story: string;
  pledge: string;
};

type FundingInfoStepProps = {
  onNext: (values: FundingInfoValues) => void;
  // 있으면 수정 모드: 모든 필드를 채워 보여주고, 값이 바뀌어야 CTA가 활성화된다
  initialValues?: FundingInfoValues;
  // 수정 모드 없이 값만 미리 채운다. 수정 시트에서 바꾼 값을 숨겨 둔 입력 단계에 반영할 때 쓴다
  defaultValues?: FundingInfoValues;
  // 있으면 CTA에 이전 버튼을 둔다
  onPrev?: () => void;
  submitLabel?: string;
};

export default function FundingInfoStep({
  onNext,
  initialValues,
  defaultValues,
  onPrev,
  submitLabel = "다음",
}: FundingInfoStepProps) {
  const seed = initialValues ?? defaultValues;
  // 값이 미리 채워진 채로 시작하면 모든 필드를 모션·자동 포커스 없이 바로 보여준다
  const isEdit = seed !== undefined;
  const [deadline, setDeadline] = useState(seed?.deadline ?? "");
  // 한 번 나타난 사연은 마감일을 지워도 유지한다
  const [showStory, setShowStory] = useState(isEdit);
  const [story, setStory] = useState(seed?.story ?? "");
  // 한 번 나타난 공약도 사연을 지워도 유지한다
  const [showPledge, setShowPledge] = useState(isEdit);
  const [pledge, setPledge] = useState(seed?.pledge ?? "");
  const stage: Stage = showPledge ? "pledge" : showStory ? "story" : "deadline";
  // iOS는 키보드 열림·닫힘 이벤트가 없어 필드의 focus·blur를 키보드가 올라온 시점으로 본다
  const [isTyping, setIsTyping] = useState(false);
  const storyRef = useRef<HTMLTextAreaElement>(null);
  const minDeadline = addDays(getTodayDate(), 1);

  // 사연 TextArea의 blur가 버블링되어 사연 영역에서 잡힌다
  const revealPledge = () => {
    if (story.trim()) setShowPledge(true);
  };

  // 공약은 선택 필드라 조건에서 제외한다
  const isChanged =
    !initialValues ||
    deadline !== initialValues.deadline ||
    story !== initialValues.story ||
    pledge !== initialValues.pledge;
  const canSubmit = deadline !== "" && story.trim() !== "" && isChanged;

  // 수정 모드에서는 시트가 열리자마자 키보드가 올라오지 않게 자동 포커스를 하지 않는다
  const focusIfCreating = (element: HTMLElement | null) => {
    if (!isEdit) element?.focus({ preventScroll: true });
  };

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
        initial={isEdit ? false : { opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={showStory ? FOLLOW_TITLE_TRANSITION : TITLE_TRANSITION}
        className="w-full">
        <Title
          type="a2z"
          title={STAGE_TITLE[stage].title}
          description={STAGE_TITLE[stage].description}
        />
      </motion.div>
      {showPledge && (
        <motion.div
          initial={isEdit ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={FOLLOW_FIELD_TRANSITION}
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
          initial={isEdit ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...FOLLOW_FIELD_TRANSITION, layout: PUSH_DOWN_TRANSITION }}
          onAnimationComplete={() => focusIfCreating(storyRef.current)}
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
          // 날짜 선택 UI가 min을 막지만 한 번 더 거른다
          onDeadlineChange={date => {
            const next = date >= minDeadline ? date : "";
            setDeadline(next);
            // 달력·휠 시트는 blur 없이 닫히므로 날짜를 확정하는 즉시 사연을 연다
            if (next) setShowStory(true);
          }}
        />
      </motion.div>
      {showPledge && (
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
              onClick={() => onNext({ deadline, story, pledge })}
              className="flex-1">
              {submitLabel}
            </Button>
          </motion.div>
        </BottomCTA>
      )}
    </div>
  );
}
