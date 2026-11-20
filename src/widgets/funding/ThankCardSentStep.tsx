"use client";

import { useEffect, useRef, useState } from "react";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import TextButton from "@/components/TextButton";
import Title from "@/components/Title";
import ToastMessage from "@/components/ToastMessage";
import type { Color } from "@/constants/color";
import { cn } from "@/utils/cn";
import { saveNodeAsImage } from "@/utils/saveNodeAsImage";
import ThankCard, { THANK_CARD_MESSAGE_CLASS } from "@/widgets/funding/ThankCard";
import IconDownload from "@/assets/icons/icon-download.svg?react";

type ThankCardSentStepProps = {
  recipientName: string;
  color: Color;
  message: string;
  isSharing: boolean;
  onShare: () => void;
};

const SAVE_FAIL_TOAST_MS = 2000;

export default function ThankCardSentStep({
  recipientName,
  color,
  message,
  isSharing,
  onShare,
}: ThankCardSentStepProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const failTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(failTimerRef.current), []);

  const handleSave = async () => {
    if (!cardRef.current) return;
    try {
      await saveNodeAsImage(cardRef.current, `${recipientName}-감사-카드.png`);
    } catch {
      setSaveFailed(true);
      clearTimeout(failTimerRef.current);
      failTimerRef.current = setTimeout(() => setSaveFailed(false), SAVE_FAIL_TOAST_MS);
    }
  };

  return (
    <>
      <div className="flex w-full max-w-[320px] flex-col pb-[calc(7rem+env(safe-area-inset-bottom))]">
        <Title
          type="a2z"
          title={`${recipientName}에게\n감사 카드를 보냈어요`}
          description="친구에게 카톡이나 링크로 공유해봐요"
        />
        <div className="flex flex-col gap-2">
          <div className="flex h-8 items-center justify-between px-4">
            <h2 className="text-semantic-text-primary [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-small)]">
              카드 이미지
            </h2>
            <TextButton
              size="medium"
              label="다운받기"
              icon={<IconDownload />}
              onClick={handleSave}
            />
          </div>
          {/* 저장되는 이미지는 이 틀 그대로다 */}
          <div ref={cardRef} className="rounded-[28px]">
            <ThankCard color={color} recipientName={recipientName}>
              <p className={cn("break-words whitespace-pre-wrap", THANK_CARD_MESSAGE_CLASS)}>
                {message}
              </p>
            </ThankCard>
          </div>
        </div>
      </div>
      <ToastMessage show={saveFailed} state={false} text="이미지를 저장하지 못했어요" />
      <BottomCTA>
        <Button
          color="neutral"
          size="xlarge"
          states={isSharing ? "loading" : "default"}
          onClick={onShare}>
          친구에게 공유하기
        </Button>
      </BottomCTA>
    </>
  );
}
