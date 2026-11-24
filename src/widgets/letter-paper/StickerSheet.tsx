"use client";

import IconButton from "@/components/IconButton";
import { useDragScroll } from "@/hooks/useDragScroll";
import { cn } from "@/utils/cn";
import IconClose from "@/assets/icons/icon-close.svg?react";
import StickerGuide from "@/assets/icons/multicolor/sticker-guide.svg?react";
import type { Sticker } from "@/widgets/letter-paper/stickers";

type StickerSheetProps = {
  stickers: Sticker[];
  selectedId: string | null;
  onSelect: (sticker: Sticker) => void;
  onClose: () => void;
};

export default function StickerSheet({
  stickers,
  selectedId,
  onSelect,
  onClose,
}: StickerSheetProps) {
  const dragScroll = useDragScroll<HTMLUListElement>();

  return (
    <div className="w-full px-4 pt-1">
      <div className="bg-semantic-fill-default rounded-xxx-large flex flex-col gap-2 overflow-clip px-4 pt-3 pb-4 shadow-[0_4px_16px_var(--color-semantic-shadow-default)]">
        <div className="flex items-start gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <StickerGuide aria-hidden className="size-6 shrink-0" />
            <p className="text-semantic-text-strong [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-label-small)]">
              아이콘을 편지지에 붙여보세요
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
        {/* 스크롤바는 Figma 인디케이터(3px 회색 바)처럼 보이게 스타일링한다. Firefox는 ::-webkit-scrollbar를 무시해 기본 스크롤바가 보인다 */}
        <ul
          {...dragScroll}
          className={cn(
            "grid cursor-grab touch-pan-x auto-cols-[40px] grid-flow-col grid-rows-[repeat(2,40px)] content-start gap-[14px] overflow-x-auto overflow-y-hidden pt-1 pb-3.5 active:cursor-grabbing",
            "[&::-webkit-scrollbar-thumb]:bg-semantic-text-quaternary/50 [&::-webkit-scrollbar]:h-[3px] [&::-webkit-scrollbar-thumb]:rounded-[2px] [&::-webkit-scrollbar-track]:bg-transparent",
          )}>
          {stickers.map(sticker => (
            <li key={sticker.id} className="size-10">
              <button
                type="button"
                aria-label={sticker.label}
                aria-pressed={sticker.id === selectedId}
                onClick={() => onSelect(sticker)}
                className={cn(
                  "flex size-full cursor-pointer items-center justify-center rounded-lg",
                  sticker.id === selectedId && "ring-semantic-icon-default ring-[1.5px]",
                )}>
                <sticker.Icon aria-hidden className="size-full" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
