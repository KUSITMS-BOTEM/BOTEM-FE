"use client";

import IconButton from "@/components/IconButton";
import { LETTER_ACCENT_BG_CLASS, type Color } from "@/constants/color";
import type { LetterPaperStyle } from "@/constants/letterPaperStyle";
import { cn } from "@/utils/cn";
import IconCheckCircleFill from "@/assets/icons/icon-checkcirclefill.svg?react";
import IconClose from "@/assets/icons/icon-close.svg?react";
import LetterGuide from "@/assets/icons/multicolor/letter-guide.svg?react";
import LetterPaper from "@/widgets/letter-paper/LetterPaper";

type LetterPaperSheetProps = {
  color: Color;
  selectedStyle: LetterPaperStyle;
  onSelect: (style: LetterPaperStyle) => void;
  onClose: () => void;
};

const PAPER_STYLES: { style: LetterPaperStyle; label: string }[] = [
  { style: "vividSolid", label: "비비드 솔리드" },
  { style: "colorDot", label: "컬러 도트" },
  { style: "whiteDot", label: "화이트 도트" },
  { style: "dotGrid", label: "도트 그리드" },
  { style: "solid", label: "솔리드" },
];

const COLOR_NAME: Record<Color, string> = {
  orange: "오렌지",
  lime: "라임",
  pink: "핑크",
  blue: "블루",
};

// Figma에는 lime 선택 테두리만 있어 나머지 색도 같은 규칙으로 둔다
const SELECTED_BORDER_CLASS: Record<Color, string> = {
  orange: "border-semantic-fill-brand",
  lime: "border-semantic-fill-lime",
  pink: "border-semantic-fill-pink",
  blue: "border-semantic-fill-blue",
};

// 썸네일은 320×338 편지지를 72px 폭으로 통째로 줄여 그린다 (72 / 320)
const THUMB_SCALE = 72 / 320;

export default function LetterPaperSheet({
  color,
  selectedStyle,
  onSelect,
  onClose,
}: LetterPaperSheetProps) {
  return (
    <div className="w-full pt-1">
      <div className="bg-semantic-fill-default/70 flex flex-col gap-[17px] overflow-clip rounded-2xl px-5 pt-3 pb-3 shadow-[0_4px_16px_var(--color-semantic-shadow-weak)]">
        <div className="flex items-start gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <LetterGuide aria-hidden className="size-6 shrink-0" />
            <p className="text-semantic-text-strong [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-label-small)]">
              어떤 편지지를 쓸까요?
            </p>
          </div>
          <IconButton
            size="small"
            aria-label="닫기"
            icon={<IconClose />}
            onClick={onClose}
            className="bg-semantic-fill-default/70 shadow-[0_4px_16px_var(--color-semantic-shadow-weak)]"
          />
        </div>
        <div
          className={cn(
            "h-[106px] touch-pan-y overflow-x-hidden overflow-y-auto",
            "[&::-webkit-scrollbar-thumb]:bg-semantic-text-quaternary/50 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:rounded-[2px] [&::-webkit-scrollbar-track]:bg-transparent",
          )}>
          <div className="flex items-center gap-1.5 pb-1.5">
            <span
              aria-hidden
              className={cn("size-2 shrink-0 rounded-full", LETTER_ACCENT_BG_CLASS[color])}
            />
            <p className="text-semantic-text-quaternary [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-label-x-small)]">
              {COLOR_NAME[color]}
            </p>
          </div>
          <ul className="grid grid-cols-[repeat(3,72px)] justify-between gap-y-3">
            {PAPER_STYLES.map(({ style, label }) => {
              const isSelected = style === selectedStyle;
              return (
                <li
                  key={style}
                  className={cn(
                    "relative h-[77px] w-[72px] overflow-clip rounded-[11.2px] border-[1.2px] border-solid bg-white shadow-[0_4.8px_12.8px_-1.6px_rgba(26,26,46,0.1)]",
                    isSelected
                      ? cn("border-[1.6px]", SELECTED_BORDER_CLASS[color])
                      : "border-white",
                  )}>
                  {/* 미리보기는 장식이라 버튼 밖에 둔다(편지지 안의 슬롯 버튼과 중첩되지 않게) */}
                  <div aria-hidden className="pointer-events-none h-[76.05px] w-[72px]">
                    <div
                      style={{ transform: `scale(${THUMB_SCALE})`, transformOrigin: "top left" }}>
                      <LetterPaper
                        style={style}
                        color={color}
                        text=""
                        senderName=""
                        hidePhotoSlot
                        hideEmptyIconSlots
                        slotsInert
                      />
                    </div>
                  </div>
                  {isSelected && (
                    <IconCheckCircleFill
                      aria-hidden
                      className="absolute top-[1.4px] right-[3px] size-4"
                    />
                  )}
                  <button
                    type="button"
                    aria-label={`${label} 편지지`}
                    aria-pressed={isSelected}
                    onClick={() => onSelect(style)}
                    className="absolute inset-0 cursor-pointer"
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
