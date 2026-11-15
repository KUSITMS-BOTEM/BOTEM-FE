import type { ReactNode } from "react";

import type { StaticImageData } from "next/image";

import { cn } from "@/utils/cn";
import { getLetterTextSize } from "@/utils/letter-paper/getLetterTextSize";
import type { Color } from "@/constants/color";
import {
  LETTER_PAPER_BG_CLASS,
  LETTER_PAPER_DOT_COLOR_CLASS,
  LETTER_PAPER_FROM_TEXT_CLASS,
  LETTER_PAPER_TEXT_CLASS,
  type LetterPaperStyle,
} from "@/constants/letterPaperStyle";
import Profile from "@/components/Profile";
import AssetSlot from "@/widgets/letter-paper/AssetSlot";
import VoiceMessage from "@/widgets/letter-paper/VoiceMessage";

export type LetterPaperProps = {
  style?: LetterPaperStyle;
  color?: Color;
  text: string;
  senderName: string;
  hasVoiceMessage?: boolean;
  photoSrc?: string | StaticImageData;
  largeIcon?: ReactNode;
  smallIcon?: ReactNode;
  onLargeIconClick?: () => void;
  onSmallIconClick?: () => void;
  onPhotoChange?: (file: File) => void;
  className?: string;
};

// 높이는 줄 높이(1.35)의 정수배: 20px 폰트는 27px×9줄, 17px 폰트는 22.95px×11줄. 넘치는 글은 잘린다
const TEXT_SIZE_CLASS = {
  large: "h-[243px] [font:var(--semantic-title-small)]",
  small: "h-[252px] [font:var(--semantic-title-x-small)]",
};

export default function LetterPaper({
  style = "vividSolid",
  color = "orange",
  text,
  senderName,
  hasVoiceMessage = false,
  photoSrc,
  largeIcon,
  smallIcon,
  onLargeIconClick,
  onSmallIconClick,
  onPhotoChange,
  className,
}: LetterPaperProps) {
  const size = getLetterTextSize(text);
  const dotColorClass = LETTER_PAPER_DOT_COLOR_CLASS[style]?.[color];

  return (
    <div
      className={cn(
        "border-semantic-border-inverted relative flex h-[338px] w-[320px] flex-col justify-between overflow-clip rounded-[28px] border p-5 shadow-[0_10px_30px_-4px_rgba(26,26,46,0.08)]",
        LETTER_PAPER_BG_CLASS[style][color],
        className,
      )}>
      {dotColorClass && (
        <div aria-hidden className="pointer-events-none absolute -inset-px">
          <div
            className={cn(
              "absolute top-[20px] left-[18px] h-[308px] w-[290px] bg-[radial-gradient(circle_at_1px_1px,var(--dot)_1px,transparent_1px)] bg-[length:18px_18px]",
              dotColorClass,
            )}
          />
        </div>
      )}
      <p
        className={cn(
          "relative shrink-0 overflow-hidden [letter-spacing:var(--letter-spacing-default)] break-words whitespace-pre-wrap",
          TEXT_SIZE_CLASS[size],
          LETTER_PAPER_TEXT_CLASS[style][color],
        )}>
        {/* 슬롯을 비껴가는 계단형 영역 (좌상단 기준 px, Figma 슬롯 bbox 기준) */}
        <span
          aria-hidden
          className="float-right h-[257px] w-[169px] [shape-outside:polygon(10px_115px,169px_115px,169px_257px,0_257px,0_193px,10px_193px)]"
        />
        {text}
      </p>
      <div className="relative flex items-center justify-between">
        {hasVoiceMessage && <VoiceMessage color={color} />}
        <div
          className={cn(
            "ml-auto flex items-center gap-1.5 [font:var(--semantic-subtext-medium-strong)]",
            LETTER_PAPER_FROM_TEXT_CLASS[style][color],
          )}>
          <Profile color={color} showIconButton={false} className="size-5" />
          <span>From. {senderName}</span>
        </div>
      </div>
      <div className="pointer-events-none absolute -inset-px">
        <AssetSlot
          type="photo"
          src={photoSrc}
          onImageChange={onPhotoChange}
          className="pointer-events-auto absolute top-[136px] left-[188.84px] origin-top-left rotate-[22deg]"
        />
        <AssetSlot
          type="icon"
          asset={largeIcon}
          onClick={onLargeIconClick}
          className="pointer-events-auto absolute top-[214.14px] left-[130px] origin-top-left -rotate-[17.77deg]"
        />
        <AssetSlot
          type="icon"
          asset={smallIcon}
          onClick={onSmallIconClick}
          className="pointer-events-auto absolute top-[160.03px] left-[270.14px] size-[34px] origin-top-left -rotate-[11.45deg]"
        />
      </div>
    </div>
  );
}
