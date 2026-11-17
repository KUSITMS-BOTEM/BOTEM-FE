import type { MouseEvent, ReactNode } from "react";

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
  voiceAudio?: Blob;
  photoSrc?: string | StaticImageData;
  largeIcon?: ReactNode;
  smallIcon?: ReactNode;
  onLargeIconClick?: () => void;
  onSmallIconClick?: () => void;
  onPhotoChange?: (file: File) => void;
  slotsInert?: boolean;
  // 있으면 text 대신 본문 영역에 이 내용을 넣는다(편지 작성 화면의 입력 영역). 줄 수·글씨 크기·슬롯 회피는 그대로 적용된다
  textSlot?: ReactNode;
  // 본문 위에 입력란 등을 둘 48px를 비운다. 슬롯 회피 영역은 제자리에 둔다
  textTopInset?: boolean;
  // 있으면 'Profile + From. 이름' 영역이 버튼이 된다(편지 작성 화면에서 이름 입력란을 다시 연다)
  onSenderClick?: () => void;
  // 글자 수와 무관하게 작은 글씨로 고정한다(편지 작성 화면에서 글이 큰 글씨 영역을 넘칠 때)
  forceSmallText?: boolean;
  className?: string;
};

// 슬롯을 비껴가는 계단형 영역의 폭과 모양 (좌상단 기준 px, Figma 슬롯 bbox 기준). border-box 기준이라 float에 음수 마진을 줘도 도형 위치가 밀리지 않는다
const LETTER_SLOT_SHAPE_CLASS =
  "w-[169px] [shape-outside:polygon(10px_115px,169px_115px,169px_257px,0_257px,0_193px,10px_193px)_border-box]";

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
  voiceAudio,
  photoSrc,
  largeIcon,
  smallIcon,
  onLargeIconClick,
  onSmallIconClick,
  onPhotoChange,
  slotsInert = false,
  textSlot,
  textTopInset = false,
  onSenderClick,
  forceSmallText = false,
  className,
}: LetterPaperProps) {
  const size = forceSmallText ? "small" : getLetterTextSize(text);
  const SenderTag = onSenderClick ? "button" : "div";
  const dotColorClass = LETTER_PAPER_DOT_COLOR_CLASS[style]?.[color];

  return (
    <div
      className={cn(
        "border-semantic-border-inverted relative flex h-[338px] w-[320px] flex-col justify-between overflow-clip rounded-[28px] border shadow-[0_10px_30px_-4px_rgba(26,26,46,0.08)]",
        "p-5",
        LETTER_PAPER_BG_CLASS[style][color],
        className,
      )}>
      {dotColorClass && (
        <div aria-hidden className="pointer-events-none absolute -inset-px">
          <div
            data-testid="letter-paper-dots"
            className={cn(
              "absolute top-[20px] left-[18px] h-[308px] w-[290px] bg-[radial-gradient(circle_at_1px_1px,var(--dot)_1px,transparent_1px)] bg-[length:18px_18px]",
              dotColorClass,
            )}
          />
        </div>
      )}
      <>
        <p
          className={cn(
            "relative shrink-0 overflow-hidden [letter-spacing:var(--letter-spacing-default)] break-words whitespace-pre-wrap",
            TEXT_SIZE_CLASS[size],
            textTopInset && "pt-12",
            LETTER_PAPER_TEXT_CLASS[style][color],
          )}>
          {/* 슬롯을 비껴가는 계단형 영역 (좌상단 기준 px, Figma 슬롯 bbox 기준) */}
          <span
            aria-hidden
            className={cn(
              "float-right h-[257px]",
              textTopInset && "-mt-12",
              LETTER_SLOT_SHAPE_CLASS,
            )}
          />
          {textSlot ?? text}
        </p>
        <div className="relative flex items-center justify-between">
          {hasVoiceMessage && <VoiceMessage color={color} audio={voiceAudio} />}
          <SenderTag
            {...(onSenderClick
              ? {
                  type: "button",
                  onClick: onSenderClick,
                  // 누르는 순간 입력란이 포커스를 잃어 먼저 사라지지 않게 한다
                  onMouseDown: (event: MouseEvent) => event.preventDefault(),
                }
              : {})}
            className={cn(
              "ml-auto flex items-center gap-1.5 [font:var(--semantic-subtext-medium-strong)]",
              onSenderClick && "cursor-pointer",
              LETTER_PAPER_FROM_TEXT_CLASS[style][color],
            )}>
            <Profile color={color} showIconButton={false} className="size-5" />
            <span>From. {senderName}</span>
          </SenderTag>
        </div>
        <div inert={slotsInert} className="pointer-events-none absolute -inset-px">
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
      </>
    </div>
  );
}
