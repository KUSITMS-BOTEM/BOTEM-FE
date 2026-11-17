"use client";

import { type FocusEvent, type Ref, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import IconGiftFilled from "@/assets/icons/multicolor/icon-gift-filled.svg?react";

export const NUMBER_FIELD_LENGTH = 4;

type NumberFieldGroupProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  ref?: Ref<HTMLInputElement>;
  className?: string;
};

// 숨은 input 하나가 값을 받고 4칸은 표시만 한다. 어느 칸을 눌러도 같은 input에 포커스되어 항상 다음 빈 칸이 활성화된다
export default function NumberFieldGroup({
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  ref,
  className,
}: NumberFieldGroupProps) {
  const [focused, setFocused] = useState(false);
  const activeIndex = Math.min(value.length, NUMBER_FIELD_LENGTH - 1);

  // 중간에 캐럿이 놓이면 Backspace가 가운데 자리를 지우므로 항상 끝으로 보낸다
  const moveCaretToEnd = (input: HTMLInputElement) =>
    input.setSelectionRange(input.value.length, input.value.length);

  return (
    <div className={cn("relative mx-auto flex w-fit gap-2", className)}>
      {Array.from({ length: NUMBER_FIELD_LENGTH }, (_, index) => (
        <div
          key={index}
          aria-hidden
          className={cn(
            "rounded-xx-large flex size-16 items-center justify-center overflow-clip border-2",
            focused && index === activeIndex
              ? "border-semantic-border-strong bg-semantic-fill-default"
              : "bg-semantic-fill-neutral-weak border-transparent",
          )}>
          {index < value.length && (
            <motion.span
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex">
              <IconGiftFilled />
            </motion.span>
          )}
        </div>
      ))}
      <input
        ref={ref}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        maxLength={NUMBER_FIELD_LENGTH}
        aria-label={label}
        aria-required="true"
        value={value}
        onChange={event => onChange(event.target.value.replace(/\D/g, ""))}
        onFocus={event => {
          setFocused(true);
          moveCaretToEnd(event.currentTarget);
          onFocus?.(event);
        }}
        onBlur={event => {
          setFocused(false);
          onBlur?.(event);
        }}
        onClick={event => moveCaretToEnd(event.currentTarget)}
        className="absolute inset-0 size-full cursor-pointer opacity-0"
      />
    </div>
  );
}
