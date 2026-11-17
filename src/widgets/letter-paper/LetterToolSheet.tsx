"use client";

import IconButton from "@/components/IconButton";
import { cn } from "@/utils/cn";
import IconClose from "@/assets/icons/icon-close.svg?react";
import ToolLetter from "@/assets/icons/multicolor/tool-sheet-letter.svg?react";
import ToolPhoto from "@/assets/icons/multicolor/tool-sheet-photo.svg?react";
import ToolRecord from "@/assets/icons/multicolor/tool-sheet-record.svg?react";
import ToolSticker from "@/assets/icons/multicolor/tool-sheet-sticker.svg?react";

type LetterToolSheetProps = {
  onClose: () => void;
  onSelectRecord?: () => void;
  onSelectSticker?: () => void;
};

// 툴마다 기울기와 회전 후 차지하는 칸 크기가 Figma에 따로 정해져 있다
const TOOLS = [
  {
    label: "녹음",
    Icon: ToolRecord,
    boxClass: "h-[81.956px] w-[73.158px]",
    tiltClass: "-rotate-[10.56deg]",
  },
  {
    label: "스티커",
    Icon: ToolSticker,
    boxClass: "h-[82.576px] w-[73.95px]",
    tiltClass: "rotate-[11.32deg]",
  },
  {
    label: "사진 추가",
    Icon: ToolPhoto,
    boxClass: "h-[75.753px] w-[65.479px]",
    tiltClass: "-rotate-[3.67deg]",
  },
  {
    label: "편지지",
    Icon: ToolLetter,
    boxClass: "h-[86.473px] w-[79.091px]",
    tiltClass: "rotate-[16.67deg]",
  },
];

export default function LetterToolSheet({
  onClose,
  onSelectRecord,
  onSelectSticker,
}: LetterToolSheetProps) {
  const handlers: Record<string, (() => void) | undefined> = {
    녹음: onSelectRecord,
    스티커: onSelectSticker,
  };

  return (
    <div className="w-full px-4 pt-1">
      <div className="bg-semantic-fill-default/70 flex h-[168px] flex-col gap-2 overflow-clip rounded-2xl px-4 pt-3 pb-4 shadow-[0_4px_16px_var(--color-semantic-shadow-weak)]">
        <div className="flex items-start gap-2">
          <p className="text-semantic-text-strong min-w-0 flex-1 [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-label-medium)]">
            어떤 툴을 추가할까요?
          </p>
          <IconButton
            size="small"
            aria-label="닫기"
            icon={<IconClose />}
            onClick={onClose}
            className="bg-semantic-fill-default/70 shadow-[0_4px_16px_var(--color-semantic-shadow-weak)]"
          />
        </div>
        <ul className="flex min-h-0 flex-1 items-center justify-center px-2.5">
          {TOOLS.map(({ label, Icon, boxClass, tiltClass }) => (
            <li
              key={label}
              className={cn("flex shrink-0 cursor-pointer items-center justify-center", boxClass)}>
              <button
                type="button"
                onClick={handlers[label]}
                className={cn(
                  "flex w-[61px] flex-none cursor-pointer flex-col items-center justify-center gap-2 py-[7px]",
                  tiltClass,
                )}>
                <Icon aria-hidden className="size-8 shrink-0" />
                <span className="text-semantic-text-strong text-center [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-label-x-small)]">
                  {label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
