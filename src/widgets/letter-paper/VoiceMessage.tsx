import { cn } from "@/utils/cn";
import { LETTER_ACCENT_BG_CLASS, type Color } from "@/constants/color";
import IconRecord from "@/assets/icons/multicolor/ico-record.svg?react";

const WAVEFORM_BAR_HEIGHTS = ["h-2", "h-3.5", "h-[22px]", "h-[18px]", "h-2"];

type VoiceMessageProps = {
  color?: Color;
  className?: string;
};

export default function VoiceMessage({ color = "pink", className }: VoiceMessageProps) {
  return (
    <div
      role="img"
      aria-label="음성 메시지"
      className={cn(
        "bg-semantic-fill-default flex h-10 w-[91px] items-center gap-2.5 rounded-full px-2 py-1 shadow-[0_4px_16px_var(--color-semantic-shadow-weak)] backdrop-blur-[3.57px]",
        className,
      )}>
      <div className="bg-semantic-fill-neutral flex size-8 shrink-0 flex-col items-start rounded-full pt-[5px] pl-[5px]">
        <IconRecord aria-hidden />
      </div>
      <div aria-hidden className="flex shrink-0 items-center gap-0.5">
        {WAVEFORM_BAR_HEIGHTS.map((height, index) => (
          <span
            key={index}
            className={cn("w-[5px] rounded-[48px]", height, LETTER_ACCENT_BG_CLASS[color])}
          />
        ))}
      </div>
    </div>
  );
}
