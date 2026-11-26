"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import Badge from "@/components/Badge";
import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import OpenSheet from "@/components/OpenSheet";
import Title from "@/components/Title";
import ToastMessage from "@/components/ToastMessage";
import { usePreparedImageSave } from "@/hooks/usePreparedImageSave";
import { formatDeadlineShort } from "@/utils/funding/formatDeadline";
import FundingBragCard from "@/widgets/funding/FundingBragCard";

const SAVE_FAIL_TOAST_MS = 2000;
// 카드 등장 모션(배지가 마지막으로 1.1초 뒤 나타남)이 끝난 모습을 저장하려고 그 뒤에 이미지를 만든다
const CARD_SETTLED_MS = 1500;

type SurpriseReadySheetProps = {
  open: boolean;
  recipientName: string;
  /** 받는 사람에게 공개되는 시각. 예: "10월 13일 0시". 없으면 시각 없이 안내한다 */
  revealDateLabel?: string;
  /** 함께한 친구 수 */
  contributorCount: number;
  /** 달성률(%) */
  progress: number;
  productImageUrl: string;
  productName: string;
  /** "YYYY-MM-DD" */
  startDate: string;
  /** "YYYY-MM-DD" */
  endDate: string;
  /** 우측 상단 X */
  onClose: () => void;
};

// SUR-PG-008. 개설자가 선물 준비 화면에서 '선물 준비하기'를 마치면 뜨는 "선물 준비 완료" 카드. 공유하기는 카드를 이미지로 저장한다
export default function SurpriseReadySheet({
  open,
  recipientName,
  revealDateLabel,
  contributorCount,
  progress,
  productImageUrl,
  productName,
  startDate,
  endDate,
  onClose,
}: SurpriseReadySheetProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const cardRef = useRef<HTMLDivElement>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const failTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const saveImage = usePreparedImageSave(cardRef, `${recipientName}-선물-준비-완료.png`, {
    enabled: open,
    delayMs: CARD_SETTLED_MS,
  });

  useEffect(() => () => clearTimeout(failTimerRef.current), []);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await saveImage();
    } catch {
      setSaveFailed(true);
      clearTimeout(failTimerRef.current);
      failTimerRef.current = setTimeout(() => setSaveFailed(false), SAVE_FAIL_TOAST_MS);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <OpenSheet open={open} title="" ariaLabel="선물 준비 완료" onClose={onClose}>
      <Title
        title="선물 준비 완료!"
        description={`${revealDateLabel ? `${revealDateLabel}에` : "곧"} ${recipientName}에게 공개돼요\n함께한 친구 ${contributorCount}명에게 알렸어요`}
      />
      <div className="flex w-full flex-1 items-center justify-center pb-[calc(7rem+env(safe-area-inset-bottom))]">
        {/* 저장되는 이미지는 이 틀 그대로라 흰 배경과 둥근 모서리를 여기서 정한다 */}
        <div
          ref={cardRef}
          className="bg-semantic-fill-default h-94 w-80 shrink-0 overflow-clip rounded-[32px]">
          <FundingBragCard
            title={`쉿!\n${recipientName} 선물 준비 완료!`}
            ariaLabel={`${recipientName}님을 위한 선물 준비 완료`}
            productImageUrl={productImageUrl}
            productName={productName}
            deadline={endDate}
            productCaption={`${formatDeadlineShort(startDate)} ~ ${formatDeadlineShort(endDate)}`}
            badge={
              <Badge
                color="brand"
                size="medium"
                label={`${progress}% 달성`}
                className="rounded-full"
              />
            }
            showProfile={false}
            reduceMotion={reduceMotion}
          />
        </div>
      </div>
      <BottomCTA>
        <Button
          color="brand"
          size="xlarge"
          states={isSaving ? "loading" : "default"}
          onClick={handleSave}>
          공유하기
        </Button>
      </BottomCTA>
      <ToastMessage show={saveFailed} state={false} text="이미지를 저장하지 못했어요" />
    </OpenSheet>
  );
}
