import { cn } from "@/utils/cn";
import { LETTER_ACCENT_TEXT_CLASS, type Color } from "@/constants/color";
import IconPlay from "@/assets/icons/multicolor/play-button-play.svg?react";
import IconPause from "@/assets/icons/multicolor/play-button-pause.svg?react";

type PlayButtonProps = {
  color: Color;
  isPlaying?: boolean;
  onClick?: () => void;
  className?: string;
};

export default function PlayButton({
  color,
  isPlaying = false,
  onClick,
  className,
}: PlayButtonProps) {
  const Icon = isPlaying ? IconPause : IconPlay;

  return (
    <button
      type="button"
      aria-label={isPlaying ? "일시정지" : "재생"}
      onClick={onClick}
      className={cn("size-7.5 shrink-0", LETTER_ACCENT_TEXT_CLASS[color], className)}>
      <Icon aria-hidden className="size-full" />
    </button>
  );
}
