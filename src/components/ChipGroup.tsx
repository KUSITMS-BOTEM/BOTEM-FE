"use client";

import { useRef, type MouseEvent, type PointerEvent } from "react";
import { cn } from "@/utils/cn";
import Chip from "@/components/Chip";

type ChipGroupItem = {
  value: string;
  label: string;
};

type ChipGroupProps = {
  items: ChipGroupItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

const DRAG_THRESHOLD_PX = 5;

export default function ChipGroup({ items, value, onChange, className }: ChipGroupProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; scrollLeft: number } | null>(null);
  const hasDragged = useRef(false);

  // 트랙패드·터치는 overflow-x-auto만으로 스크롤되지만, 데스크탑 마우스는 가로 휠/스와이프가 없어 드래그로도 스크롤되게 한다
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    dragStart.current = { x: event.clientX, scrollLeft: scrollEl.scrollLeft };
    hasDragged.current = false;
    scrollEl.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || !dragStart.current) return;
    const delta = event.clientX - dragStart.current.x;
    if (Math.abs(delta) > DRAG_THRESHOLD_PX) hasDragged.current = true;
    scrollEl.scrollLeft = dragStart.current.scrollLeft - delta;
  };

  const handlePointerUp = () => {
    dragStart.current = null;
  };

  // 드래그 끝에 손을 뗀 지점의 Chip에서 click이 발생해 의도치 않게 선택되는 것을 막는다
  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (hasDragged.current) {
      event.stopPropagation();
      event.preventDefault();
    }
  };

  return (
    <div
      ref={scrollRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClickCapture={handleClickCapture}
      className={cn(
        "flex w-full cursor-grab gap-1 overflow-x-auto active:cursor-grabbing",
        "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}>
      {items.map(item => (
        <Chip
          key={item.value}
          label={item.label}
          selected={item.value === value}
          onClick={() => onChange(item.value)}
        />
      ))}
    </div>
  );
}
