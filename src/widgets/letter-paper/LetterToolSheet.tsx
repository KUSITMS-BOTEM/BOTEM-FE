"use client";

import IconButton from "@/components/IconButton";
import type { Color } from "@/constants/color";
import { cn } from "@/utils/cn";
import IconClose from "@/assets/icons/icon-close.svg?react";
import LetterTool, { type LetterToolType } from "@/widgets/letter-paper/LetterTool";

type LetterToolSheetProps = {
  color: Color;
  onClose: () => void;
  onSelectRecord?: () => void;
  onSelectSticker?: () => void;
  onSelectPhoto?: () => void;
  onSelectLetter?: () => void;
};

// 툴마다 회전 후 차지하는 칸 크기가 Figma에 따로 정해져 있다
const TOOLS: {
  type: LetterToolType;
  handler: "onSelectRecord" | "onSelectSticker" | "onSelectPhoto" | "onSelectLetter";
  boxClass: string;
}[] = [
  { type: "record", handler: "onSelectRecord", boxClass: "h-[81.956px] w-[73.158px]" },
  { type: "sticker", handler: "onSelectSticker", boxClass: "h-[82.576px] w-[73.95px]" },
  { type: "photo", handler: "onSelectPhoto", boxClass: "h-[75.753px] w-[65.479px]" },
  { type: "letter", handler: "onSelectLetter", boxClass: "h-[86.473px] w-[79.091px]" },
];

export default function LetterToolSheet({
  color,
  onClose,
  onSelectRecord,
  onSelectSticker,
  onSelectPhoto,
  onSelectLetter,
}: LetterToolSheetProps) {
  const handlers = {
    onSelectRecord,
    onSelectSticker,
    onSelectPhoto,
    onSelectLetter,
  };

  return (
    <div className="w-full pt-1">
      <div className="bg-semantic-fill-default rounded-xxx-large flex h-[168px] flex-col gap-2 overflow-clip px-4 pt-3 pb-4 shadow-[0_4px_16px_var(--color-semantic-shadow-default)]">
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
          {TOOLS.map(({ type, handler, boxClass }) => (
            <li key={type} className={cn("flex shrink-0 items-center justify-center", boxClass)}>
              <LetterTool
                type={type}
                color={color}
                onClick={handlers[handler]}
                className={handlers[handler] ? "cursor-pointer" : undefined}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
