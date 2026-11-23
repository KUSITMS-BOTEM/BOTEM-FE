"use client";

import { useId } from "react";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Chip from "@/components/Chip";
import TextCounter from "@/components/TextCounter";
import type { Color } from "@/constants/color";
import { cn } from "@/utils/cn";
import ThankCard, { THANK_CARD_MESSAGE_CLASS } from "@/widgets/funding/ThankCard";
import PaletteArea from "@/widgets/letter-paper/PaletteArea";

type ThankCardWriteStepProps = {
  recipientName: string;
  color: Color;
  onColorChange: (color: Color) => void;
  message: string;
  onMessageChange: (message: string) => void;
  isSending: boolean;
  onSend: () => void;
};

// 서버가 공백 제거 후 1~50자만 받는다
export const THANK_CARD_MESSAGE_MAX_LENGTH = 50;
const SUGGESTED_MESSAGES = ["고마워", "너가 최고야", "꼭 인증할게!"];

const appendSuggestion = (message: string, suggestion: string) => {
  const base = message.trimEnd();
  return (base ? `${base} ${suggestion}` : suggestion).slice(0, THANK_CARD_MESSAGE_MAX_LENGTH);
};

export default function ThankCardWriteStep({
  recipientName,
  color,
  onColorChange,
  message,
  onMessageChange,
  isSending,
  onSend,
}: ThankCardWriteStepProps) {
  const counterId = useId();

  return (
    <>
      <div className="flex w-full max-w-[324px] flex-col pb-[calc(7rem+env(safe-area-inset-bottom))]">
        <PaletteArea
          color={color}
          onColorChange={onColorChange}
          showAddButton={false}
          tooltip={false}
        />
        <div className="flex flex-col gap-4">
          <ThankCard color={color} recipientName={recipientName}>
            <textarea
              aria-label="감사 카드 내용"
              aria-describedby={counterId}
              placeholder={"고마운 마음을\n한마디로 전해볼까요?"}
              maxLength={THANK_CARD_MESSAGE_MAX_LENGTH}
              value={message}
              onChange={event => onMessageChange(event.target.value)}
              className={cn(
                "placeholder:text-semantic-text-quaternary h-full w-full resize-none bg-transparent outline-none",
                THANK_CARD_MESSAGE_CLASS,
              )}
            />
          </ThankCard>
          <div className="flex items-start justify-between pl-5">
            <div className="flex flex-1 flex-wrap gap-1">
              {SUGGESTED_MESSAGES.map(suggestion => (
                <Chip
                  key={suggestion}
                  size="small"
                  label={suggestion}
                  // 선택 상태가 없는 추천 문구라 토글 버튼으로 읽히지 않게 한다
                  aria-pressed={undefined}
                  onClick={() => onMessageChange(appendSuggestion(message, suggestion))}
                />
              ))}
            </div>
            <TextCounter
              id={counterId}
              length={message.length}
              maxLength={THANK_CARD_MESSAGE_MAX_LENGTH}
            />
          </div>
        </div>
      </div>
      <BottomCTA>
        <Button
          color="brand"
          size="xlarge"
          states={isSending ? "loading" : "default"}
          disabled={message.trim() === ""}
          onClick={onSend}>
          보내기
        </Button>
      </BottomCTA>
    </>
  );
}
