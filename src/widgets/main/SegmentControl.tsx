"use client";

import { useId, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

export type SegmentValue = "funding" | "wish";

const SEGMENTS: { value: SegmentValue; label: string }[] = [
  { value: "funding", label: "펀딩" },
  { value: "wish", label: "위시" },
];

const PANEL_STYLE =
  "bg-semantic-fill-default/70 shadow-[0_4px_16px_0_var(--color-semantic-shadow-weak)] rounded-full";

type SegmentControlProps = {
  onChange?: (value: SegmentValue) => void;
  className?: string;
};

export default function SegmentControl({ onChange, className }: SegmentControlProps) {
  const [value, setValue] = useState<SegmentValue>("funding");
  const indicatorId = useId();

  const handleSelect = (next: SegmentValue) => {
    setValue(next);
    onChange?.(next);
  };

  return (
    <div role="tablist" className={cn("flex items-center gap-1 p-2", PANEL_STYLE, className)}>
      {SEGMENTS.map(segment => {
        const selected = segment.value === value;
        return (
          <button
            key={segment.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => handleSelect(segment.value)}
            className="relative flex cursor-pointer items-center justify-center px-4 py-1">
            {selected && (
              <motion.span
                layoutId={indicatorId}
                aria-hidden
                className={cn("absolute inset-0", PANEL_STYLE)}
                transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
              />
            )}
            <span
              className={cn(
                "relative text-center [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap",
                selected
                  ? "text-semantic-text-primary [font:var(--semantic-label-small-strong)]"
                  : "text-semantic-text-quaternary [font:var(--semantic-label-small-weak)]",
              )}>
              {segment.label}
            </span>
            <span aria-hidden className="absolute inset-x-0 top-1/2 h-10 -translate-y-1/2" />
          </button>
        );
      })}
    </div>
  );
}
