"use client";

import {
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
  useId,
  useLayoutEffect,
} from "react";
import { cn } from "@/utils/cn";
import useClearableInput from "@/hooks/useClearableInput";
import FieldMessage from "@/components/FieldMessage";
import TextCounter from "@/components/TextCounter";
import IconClear from "@/assets/icons/icon-clear.svg?react";

type TextAreaOwnProps = {
  label: string;
  helperText?: ReactNode;
  error?: boolean;
  value?: string;
  defaultValue?: string;
  onClear?: () => void;
  ref?: Ref<HTMLTextAreaElement>;
};

type TextAreaProps = TextAreaOwnProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, keyof TextAreaOwnProps>;

export default function TextArea({
  label,
  helperText,
  error: errorProp = false,
  value,
  defaultValue = "",
  onChange,
  onClear,
  ref,
  id,
  required,
  disabled,
  readOnly,
  maxLength,
  className,
  "aria-describedby": ariaDescribedBy,
  ...props
}: TextAreaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const helperTextId = `${textareaId}-help`;
  const counterId = `${textareaId}-counter`;
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

  useLayoutEffect(() => {
    const textarea = elementRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [currentValue, elementRef]);

  const showClearButton = !disabled && !readOnly && canClear && currentValue.length > 0;
  const showHelperRow = helperText !== undefined || maxLength !== undefined;

  return (
    <div className={cn("flex w-full flex-col gap-2", disabled && "opacity-60", className)}>
      <div
        className={cn(
          "group flex flex-col gap-2 overflow-clip rounded-3xl border-2 px-5 py-3 transition-colors",
          error
            ? "border-semantic-border-danger bg-semantic-fill-danger-weak"
            : "bg-semantic-fill-neutral-weak focus-within:border-semantic-border-strong focus-within:bg-semantic-fill-default border-transparent",
        )}>
        <div className="flex items-start gap-0.5 pt-2">
          <label
            htmlFor={textareaId}
            className={cn(
              "min-w-0 truncate [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-small-weak)]",
              error ? "text-semantic-text-danger" : "text-semantic-text-tertiary",
            )}>
            {label}
          </label>
          {required && (
            <span aria-hidden className="bg-semantic-fill-danger size-1 shrink-0 rounded-full" />
          )}
        </div>
        <div className="flex min-h-24 items-start gap-1">
          <textarea
            {...props}
            ref={elementRef}
            id={textareaId}
            value={currentValue}
            onChange={handleChange}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={error}
            aria-describedby={describedBy}
            className={cn(
              "min-h-24 min-w-0 flex-1 resize-none overflow-hidden bg-transparent outline-none",
              "[letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-medium-weak)]",
              "text-semantic-text-primary placeholder:text-semantic-text-quaternary",
              "disabled:cursor-not-allowed",
            )}
          />
          {showClearButton && (
            <button
              type="button"
              aria-label="입력 내용 지우기"
              // 클릭 시 textarea 포커스가 빠지면 focus-within이 풀려 버튼이 먼저 사라지므로 포커스 이동을 막는다
              onMouseDown={event => event.preventDefault()}
              onClick={handleClear}
              className="text-semantic-text-quaternary hidden shrink-0 cursor-pointer pl-2 group-focus-within:flex">
              <IconClear aria-hidden className="size-[18px]" />
            </button>
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
  );
}
