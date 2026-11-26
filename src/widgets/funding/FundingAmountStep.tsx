"use client";

import { type FocusEvent, useRef, useState } from "react";
import { motion } from "framer-motion";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import InfoBox from "@/components/InfoBox";
import SelectBox from "@/components/SelectBox";
import Title from "@/components/Title";
import { cn } from "@/utils/cn";
import { formatPerPerson } from "@/utils/funding/recommendedAmount";
import {
  CTA_CLEARANCE_CLASS,
  FIELD_TRANSITION,
  FOLLOW_FIELD_TRANSITION,
  FOLLOW_TITLE_TRANSITION,
  PUSH_DOWN_TRANSITION,
  TITLE_TRANSITION,
} from "@/widgets/funding/fundingStepMotion";
import RecommendedAmountSheet from "@/widgets/funding/RecommendedAmountSheet";
import TargetAmountField from "@/widgets/funding/TargetAmountField";

export type FundingAmountValues = {
  targetAmount: string;
  // 선택 입력이라 정하지 않으면 빈 문자열
  recommendedAmount: string;
};

type FundingAmountStepProps = {
  // 목표 금액 칩과 안내 문구에 보여줄 상품 가격
  basePrice: number;
  onNext: (values: FundingAmountValues) => void;
  // 있으면 수정 모드: 모든 필드를 채워 보여주고, 값이 바뀌어야 CTA가 활성화된다
  initialValues?: FundingAmountValues;
  // 수정 모드 없이 값만 미리 채운다. 수정 시트에서 바꾼 값을 숨겨 둔 입력 단계에 반영할 때 쓴다
  defaultValues?: FundingAmountValues;
  submitLabel?: string;
};

export default function FundingAmountStep({
  basePrice,
  onNext,
  initialValues,
  defaultValues,
  submitLabel = "다음",
}: FundingAmountStepProps) {
  const seed = initialValues ?? defaultValues;
  // 값이 미리 채워진 채로 시작하면 모든 필드를 모션·자동 포커스 없이 바로 보여준다
  const isEdit = seed !== undefined;
  const [targetAmount, setTargetAmount] = useState(seed?.targetAmount ?? "");
  const [recommendedAmount, setRecommendedAmount] = useState(seed?.recommendedAmount ?? "");
  // 한 번 나타난 추천 금액은 목표 금액을 지워도 유지한다
  const [showRecommended, setShowRecommended] = useState(isEdit);
  const [sheetOpen, setSheetOpen] = useState(false);
  // iOS는 키보드 열림·닫힘 이벤트가 없어 필드의 focus·blur를 키보드가 올라온 시점으로 본다
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const target = Number(targetAmount);

  // 목표 금액이 추천 금액보다 작아지면 추천 금액이 목표를 넘으므로 비운다
  const changeTarget = (next: string) => {
    setTargetAmount(next);
    if (recommendedAmount && Number(recommendedAmount) > Number(next)) setRecommendedAmount("");
  };

  // iOS는 키보드 닫힘 이벤트가 없어 목표 금액 input의 blur(완료 버튼·바깥 탭)를 키보드가 닫힌 시점으로 본다
  const revealRecommended = () => {
    if (target > 0) setShowRecommended(true);
  };

  // 추천 금액은 선택이라 목표 금액만 있으면 제출할 수 있다
  const isChanged =
    !initialValues ||
    targetAmount !== initialValues.targetAmount ||
    recommendedAmount !== initialValues.recommendedAmount;
  const canSubmit = target > 0 && isChanged;

  // 수정 모드에서는 시트가 열리자마자 키보드가 올라오지 않게 자동 포커스를 하지 않는다
  const focusIfCreating = (element: HTMLElement | null) => {
    if (!isEdit) element?.focus({ preventScroll: true });
  };

  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    setIsTyping(event.target.matches("input"));
  };

  return (
    <>
      <div
        onFocus={handleFocus}
        onBlur={() => setIsTyping(false)}
        className={cn("flex w-full flex-col gap-4", showRecommended && CTA_CLEARANCE_CLASS)}>
        <motion.div
          key={showRecommended ? "recommended" : "target"}
          initial={isEdit ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={showRecommended ? FOLLOW_TITLE_TRANSITION : TITLE_TRANSITION}
          className="w-full">
          <Title
            type="a2z"
            title={showRecommended ? "한 명당 얼마씩 모을까요?" : "목표 금액은 얼마인가요?"}
            description={showRecommended ? "친구가 참고할 금액이에요. 건너뛰어도 돼요" : undefined}
          />
        </motion.div>
        {showRecommended && (
          <motion.div
            layout="position"
            initial={isEdit ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...FOLLOW_FIELD_TRANSITION, layout: PUSH_DOWN_TRANSITION }}
            className="w-full">
            <SelectBox
              label="추천 금액"
              placeholder="한 명당 금액을 얼마 추천할까요?"
              value={recommendedAmount ? formatPerPerson(recommendedAmount) : undefined}
              aria-haspopup="dialog"
              onClick={() => setSheetOpen(true)}
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
          className="w-full">
          <TargetAmountField
            ref={inputRef}
            price={basePrice}
            value={targetAmount}
            showPriceChip
            onChange={changeTarget}
            onPriceChipSelect={() => {
              changeTarget(String(basePrice));
              // 칩 클릭은 input blur를 일으키지 않으므로 추천 금액 단계를 직접 연다
              if (basePrice > 0) setShowRecommended(true);
            }}
            onBlur={revealRecommended}>
            {!showRecommended && (
              <InfoBox text={`기본 상품 가격은 ${basePrice.toLocaleString("ko-KR")}원이에요`} />
            )}
          </TargetAmountField>
        </motion.div>
        {showRecommended && (
          // 키보드가 올라온 터치 기기에서는 CTA가 키보드 위에 떠 입력을 가리므로 모션 없이 숨긴다
          <BottomCTA className={cn(isTyping && "pointer-coarse:hidden")}>
            <motion.div
              initial={isEdit ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={FOLLOW_FIELD_TRANSITION}
              className="flex">
              <Button
                color="brand"
                size="xlarge"
                disabled={!canSubmit}
                onClick={() => onNext({ targetAmount, recommendedAmount })}
                className="flex-1">
                {submitLabel}
              </Button>
            </motion.div>
          </BottomCTA>
        )}
      </div>
      <RecommendedAmountSheet
        open={sheetOpen}
        targetAmount={target}
        value={recommendedAmount}
        onSelect={amount => {
          setRecommendedAmount(amount);
          setSheetOpen(false);
        }}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}
