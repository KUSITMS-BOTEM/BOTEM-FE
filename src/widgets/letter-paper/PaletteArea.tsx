import { useState } from "react";
import { cn } from "@/utils/cn";
import IconButton from "@/components/IconButton";
import {
  LETTER_ACCENT_BG_CLASS,
  LETTER_PALETTE_RING_BORDER_CLASS,
  type Color,
} from "@/constants/color";
import IconPlus from "@/assets/icons/icon-plus.svg?react";
import TooltipTail from "@/assets/icons/multicolor/tooltip-tail.svg?react";

type PaletteAreaProps = {
  color: Color;
  onColorChange?: (color: Color) => void;
  onAddClick?: () => void;
  tooltip?: boolean;
  className?: string;
};

const PALETTE_COLORS: { color: Color; label: string }[] = [
  { color: "orange", label: "주황" },
  { color: "lime", label: "라임" },
  { color: "pink", label: "핑크" },
  { color: "blue", label: "파랑" },
];

export default function PaletteArea({
  color,
  onColorChange,
  onAddClick,
  tooltip = true,
  className,
}: PaletteAreaProps) {
  const [selected, setSelected] = useState(color);
  const [prevColor, setPrevColor] = useState(color);

  // 부모가 color를 바꾸면 내부 선택도 따라간다
  if (color !== prevColor) {
    setPrevColor(color);
    setSelected(color);
  }

  const handleSelect = (next: Color) => {
    setSelected(next);
    onColorChange?.(next);
  };

  return (
    <div className={cn("relative flex w-full flex-col px-5 pt-1 pb-5", className)}>
      <div className="flex w-full items-center justify-between">
        <div role="radiogroup" aria-label="편지지 색상" className="flex items-center gap-3">
          {PALETTE_COLORS.map(item => {
            const isSelected = item.color === selected;
            return (
              <button
                key={item.color}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={item.label}
                onClick={() => handleSelect(item.color)}
                className={cn(
                  "relative flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full",
                  "before:absolute before:-inset-2 before:content-['']",
                  isSelected && "border-[1.5px]",
                  isSelected && LETTER_PALETTE_RING_BORDER_CLASS[item.color],
                )}>
                <span className={cn("size-4 rounded-full", LETTER_ACCENT_BG_CLASS[item.color])} />
              </button>
            );
          })}
        </div>
        <IconButton
          size="xlarge"
          aria-label="나만의 편지 만들기"
          icon={<IconPlus aria-hidden />}
          onClick={onAddClick}
          className="bg-semantic-fill-default/70 shadow-[0_4px_16px_var(--color-semantic-shadow-weak)] backdrop-blur-[3.57px]"
        />
      </div>
      {tooltip && (
        <div
          role="tooltip"
          className="bg-semantic-border-inverted text-semantic-text-primary absolute right-7 bottom-full rounded-lg px-3 py-2 whitespace-nowrap [font:var(--semantic-label-x-small-weak)]">
          나만의 편지를 만들어 볼까요?
          <TooltipTail aria-hidden className="absolute top-[29px] right-[11px] rotate-90" />
        </div>
      )}
    </div>
  );
}
