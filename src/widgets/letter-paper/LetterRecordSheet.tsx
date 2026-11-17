"use client";

import IconButton from "@/components/IconButton";
import type { VoiceRecorderError, VoiceRecorderStatus } from "@/hooks/useVoiceRecorder";
import { cn } from "@/utils/cn";
import type { Color } from "@/constants/color";
import IconClose from "@/assets/icons/icon-close.svg?react";
import LiveCaption from "@/widgets/letter-paper/LiveCaption";
import RecordButton from "@/widgets/letter-paper/RecordButton";
import RecordDoneButton from "@/widgets/letter-paper/RecordDoneButton";
import WaveformBars from "@/widgets/letter-paper/WaveformBars";

type LetterRecordSheetProps = {
  status: VoiceRecorderStatus;
  error: VoiceRecorderError | null;
  color: Color;
  transcript: string;
  interim: string;
  isSpeaking?: boolean;
  onStart: () => void;
  onStop: () => void;
  onDone: () => void;
  onClose: () => void;
};

const ERROR_MESSAGE: Record<VoiceRecorderError, string> = {
  unsupported: "이 브라우저에서는 녹음할 수 없어요",
  denied: "마이크 권한을 허용해 주세요",
};
const HEADER_TEXT_CLASS =
  "text-semantic-text-strong min-w-0 flex-1 [letter-spacing:var(--letter-spacing-default)]";

export default function LetterRecordSheet({
  status,
  error,
  color,
  transcript,
  interim,
  isSpeaking = false,
  onStart,
  onStop,
  onDone,
  onClose,
}: LetterRecordSheetProps) {
  const isRecording = status === "recording";
  const isDone = status === "done";

  return (
    <div className="w-full px-4 pt-1">
      <div className="bg-semantic-fill-default/70 flex h-[168px] flex-col gap-2 overflow-clip rounded-2xl px-4 pt-3 pb-4 shadow-[0_4px_16px_var(--color-semantic-shadow-weak)]">
        <div className="flex items-start gap-2">
          {isRecording && (
            <LiveCaption
              transcript={transcript}
              interim={interim}
              className="min-h-[19px] flex-1"
            />
          )}
          {isDone && (
            <div className="max-h-[88px] min-w-0 flex-1 overflow-y-auto">
              <p
                className={cn(
                  "[letter-spacing:var(--letter-spacing-default)] break-words whitespace-pre-wrap [font:var(--semantic-label-small)]",
                  transcript ? "text-semantic-text-strong" : "text-semantic-text-quaternary",
                )}>
                {transcript || "자막을 만들지 못했어요"}
              </p>
            </div>
          )}
          {status === "idle" && (
            <p
              className={cn(
                HEADER_TEXT_CLASS,
                "whitespace-nowrap [font:var(--semantic-label-medium)]",
              )}>
              {error ? (
                ERROR_MESSAGE[error]
              ) : (
                <>
                  최대 30초까지 녹음하며
                  <br />
                  녹음 시, 자막이 자동으로 채워져요
                </>
              )}
            </p>
          )}
          <IconButton
            size="small"
            aria-label="닫기"
            icon={<IconClose />}
            onClick={onClose}
            className="bg-semantic-fill-default/70 shrink-0 shadow-[0_4px_16px_var(--color-semantic-shadow-weak)]"
          />
        </div>
        {isDone ? (
          <div className="mt-auto flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onStart}
              className="bg-semantic-fill-neutral-weak text-semantic-text-primary flex h-[26px] cursor-pointer items-center rounded-full px-[11px] py-[5px] tracking-[-0.02em] whitespace-nowrap [font:var(--semantic-label-x-small)]">
              재녹음
            </button>
            <RecordDoneButton text="녹음 완료" color={color} onClick={onDone} />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2">
            <WaveformBars
              active={isRecording && isSpeaking}
              barClassName={isRecording ? "bg-semantic-fill-neutral" : "bg-semantic-icon-primary"}
            />
            <RecordButton
              color={color}
              isRecording={isRecording}
              disabled={error === "unsupported"}
              onClick={isRecording ? onStop : onStart}
            />
            <p className="text-semantic-text-quaternary [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-subtext-medium-strong)]">
              {isRecording ? "탭하면 녹음이 중지돼요" : "탭으로 녹음 시작"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
