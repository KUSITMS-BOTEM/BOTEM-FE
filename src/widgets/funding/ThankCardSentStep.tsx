"use client";

import { useEffect, useRef, useState } from "react";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Title from "@/components/Title";
import ToastMessage from "@/components/ToastMessage";
import type { Color } from "@/constants/color";
import { cn } from "@/utils/cn";
import { saveNodeAsImage } from "@/utils/saveNodeAsImage";
import ThankCard, { THANK_CARD_MESSAGE_CLASS } from "@/widgets/funding/ThankCard";

type ThankCardSentStepProps = {
  recipientName: string;
  color: Color;
  message: string;
};

const SHARE_FAIL_TOAST_MS = 2000;

export default function ThankCardSentStep({
  recipientName,
  color,
  message,
}: ThankCardSentStepProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [shareFailed, setShareFailed] = useState(false);
  const failTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => () => clearTimeout(failTimerRef.current), []);

  const handleShare = async () => {
    if (!cardRef.current || isSharing) return;
    setIsSharing(true);
    try {
      await saveNodeAsImage(cardRef.current, `${recipientName}-감사-카드.png`);
    } catch {
      setShareFailed(true);
      clearTimeout(failTimerRef.current);
      failTimerRef.current = setTimeout(() => setShareFailed(false), SHARE_FAIL_TOAST_MS);
    } finally {
      setIsSharing(false);
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
          <div className="flex h-8 items-center px-4">
            <h2 className="text-semantic-text-primary [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-small)]">
              카드 이미지
            </h2>
          </div>
          {/* 공유되는 이미지는 이 틀 그대로다 */}
          <div ref={cardRef} className="rounded-[28px]">
            {/* 줄바꿈이 많은 메시지가 잘리지 않게 내용만큼 늘어난다 (작성 단계는 textarea라 고정 높이) */}
            <ThankCard color={color} recipientName={recipientName} className="h-auto min-h-[338px]">
              <p className={cn("break-words whitespace-pre-wrap", THANK_CARD_MESSAGE_CLASS)}>
                {message}
              </p>
            </ThankCard>
          </div>
        </div>
      </div>
      <ToastMessage show={shareFailed} state={false} text="이미지를 공유하지 못했어요" />
      <BottomCTA>
        <Button
          color="neutral"
          size="xlarge"
          states={isSharing ? "loading" : "default"}
          onClick={handleShare}>
          친구에게 공유하기
        </Button>
      </BottomCTA>
    </>
  );
}
