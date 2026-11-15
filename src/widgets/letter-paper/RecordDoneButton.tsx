import { cn } from "@/utils/cn";
import { RECORD_DONE_BUTTON_CLASS, type Color } from "@/constants/color";
import IconCheckThin from "@/assets/icons/icon-check-thin.svg?react";

type RecordDoneButtonProps = {
  text: string;
  color: Color;
  onClick?: () => void;
  className?: string;
};

export default function RecordDoneButton({
  text,
  color,
  onClick,
  className,
}: RecordDoneButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-[26px] items-center gap-1 rounded-full px-[11px] py-[5px]",
        RECORD_DONE_BUTTON_CLASS[color],
        className,
      )}>
      <span className="text-center tracking-[-0.02em] whitespace-nowrap [font:var(--semantic-label-x-small)]">
        {text}
      </span>
      <IconCheckThin aria-hidden />
    </button>
  );
}
