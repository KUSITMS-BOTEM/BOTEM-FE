"use client";

import { type InputHTMLAttributes, type ReactNode, type Ref, useId } from "react";
import { cn } from "@/utils/cn";
import useClearableInput from "@/hooks/useClearableInput";
import Chip from "@/components/Chip";
import FieldMessage from "@/components/FieldMessage";
import TextCounter from "@/components/TextCounter";
import IconClear from "@/assets/icons/icon-clear.svg?react";

export type ComboboxChip = {
  label: string;
  value: string;
  logo?: ReactNode;
};

type ComboboxOwnProps = {
  label: string;
  helperText?: ReactNode;
  error?: boolean;
  suffix?: string;
  value?: string;
  defaultValue?: string;
  onClear?: () => void;
  chips?: ComboboxChip[];
  chipPosition?: "top" | "bottom";
  chipWrap?: boolean;
  selectedChipValue?: string;
  onChipSelect?: (chip: ComboboxChip) => void;
  ref?: Ref<HTMLInputElement>;
};

type ComboboxProps = ComboboxOwnProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, keyof ComboboxOwnProps>;

export default function Combobox({
  label,
  helperText,
  error: errorProp = false,
  suffix,
  value,
  defaultValue = "",
  onChange,
  onClear,
  chips,
  chipPosition = "top",
  chipWrap = false,
  selectedChipValue,
  onChipSelect,
  ref,
  id,
  required,
  disabled,
  readOnly,
  maxLength,
  className,
  "aria-describedby": ariaDescribedBy,
  ...props
}: ComboboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperTextId = `${inputId}-help`;
  const counterId = `${inputId}-counter`;
  const describedBy =
    [
      ariaDescribedBy,
      helperText !== undefined && helperTextId,
      maxLength !== undefined && counterId,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const { elementRef, currentValue, isOverLimit, canClear, handleChange, handleClear } =
    useClearableInput({
      value,
      defaultValue,
      ref,
      maxLength,
      onChange,
      onClear,
    });
  const error = errorProp || isOverLimit;

  const showClearButton = !disabled && !readOnly && canClear && currentValue.length > 0;
  const showHelperRow = helperText !== undefined || maxLength !== undefined;

  const chipGroup = chips && chips.length > 0 && (
    <div
      role="group"
      aria-label={`${label} 선택`}
      className={cn("flex w-full gap-1", chipWrap && "flex-wrap")}>
      {chips.map(chip => (
        <Chip
          key={chip.value}
          label={chip.label}
          logo={chip.logo}
          selected={chip.value === selectedChipValue}
          disabled={disabled}
          onClick={() => onChipSelect?.(chip)}
        />
      ))}
    </div>
  );

  return (
    <div className={cn("flex w-full flex-col gap-3", disabled && "opacity-60", className)}>
      {chipPosition === "top" && chipGroup}
      <div className="flex w-full flex-col gap-2">
        <div
          className={cn(
            "group flex flex-col justify-center overflow-clip rounded-3xl border-2 px-5 py-3 transition-colors",
            error
              ? "border-semantic-border-danger bg-semantic-fill-danger-weak"
              : "bg-semantic-fill-neutral-weak focus-within:border-semantic-border-strong focus-within:bg-semantic-fill-default border-transparent",
          )}>
          <div className="flex items-start gap-0.5 pt-2">
            <label
              htmlFor={inputId}
              className={cn(
                "truncate [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-small-weak)]",
                error ? "text-semantic-text-danger" : "text-semantic-text-tertiary",
              )}>
              {label}
            </label>
            {required && (
              <span aria-hidden className="bg-semantic-fill-danger size-1 shrink-0 rounded-full" />
            )}
          </div>
          <div className="flex h-10 items-center gap-1">
            <input
              {...props}
              ref={elementRef}
              id={inputId}
              value={currentValue}
              onChange={handleChange}
              required={required}
              disabled={disabled}
              readOnly={readOnly}
              aria-invalid={error}
              aria-describedby={describedBy}
              className={cn(
                "h-full min-w-0 flex-1 bg-transparent outline-none",
                "[letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-medium-weak)]",
                "text-semantic-text-primary placeholder:text-semantic-text-quaternary",
                "disabled:cursor-not-allowed",
              )}
            />
            {(showClearButton || suffix) && (
              <div className="flex h-full shrink-0 items-center justify-end gap-2 pl-2">
                {showClearButton && (
                  <button
                    type="button"
                    aria-label="입력 내용 지우기"
                    // 클릭 시 input 포커스가 빠지면 focus-within이 풀려 버튼이 먼저 사라지므로 포커스 이동을 막는다
                    onMouseDown={event => event.preventDefault()}
                    onClick={handleClear}
                    className="text-semantic-text-quaternary hidden shrink-0 cursor-pointer group-focus-within:flex">
                    <IconClear aria-hidden className="size-[18px]" />
                  </button>
                )}
                {suffix && (
                  <span className="text-semantic-text-strong pr-0.5 [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-medium-strong)]">
                    {suffix}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {showHelperRow && (
          <div className="flex items-start">
            <div className="min-w-0 flex-1">
              {helperText !== undefined && (
                <FieldMessage id={helperTextId} state={error ? "error" : "default"}>
                  {helperText}
                </FieldMessage>
              )}
            </div>
            {maxLength !== undefined && (
              <TextCounter
                id={counterId}
                length={currentValue.length}
                maxLength={maxLength}
                error={error}
              />
            )}
          </div>
        )}
      </div>
      {chipPosition === "bottom" && chipGroup}
    </div>
  );
}
