import { cn } from "@/utils/cn";
import { RECORD_BUTTON_BG_CLASS, RECORD_BUTTON_ICON_CLASS, type Color } from "@/constants/color";
import IconRecordMic from "@/assets/icons/icon-record-mic.svg?react";

type RecordButtonProps = {
  color: Color;
  isRecording?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

export default function RecordButton({
  color,
  isRecording = false,
  disabled = false,
  onClick,
  className,
}: RecordButtonProps) {
  return (
    <button
      type="button"
      aria-label={isRecording ? "녹음 중지" : "녹음 시작"}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "size-10 shrink-0 rounded-full disabled:cursor-not-allowed disabled:opacity-30",
        isRecording ? RECORD_BUTTON_BG_CLASS[color] : "bg-semantic-text-quaternary",
        isRecording ? RECORD_BUTTON_ICON_CLASS[color] : "text-semantic-icon-on-fill",
        className,
      )}>
      <IconRecordMic aria-hidden />
    </button>
  );
}
