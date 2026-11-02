"use client";

import {
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  useId,
  useState,
} from "react";
import { cn } from "@/utils/cn";
import useClearableInput from "@/hooks/useClearableInput";
import FieldMessage, { type FieldMessageState } from "@/components/FieldMessage";
import TextCounter from "@/components/TextCounter";
import IconClear from "@/assets/icons/icon-clear.svg?react";

export type TextFieldRule = {
  message: string;
  validate: (value: string) => boolean;
};

type TextFieldOwnProps = {
  label: string;
  helperText?: ReactNode;
  rules?: TextFieldRule[];
  error?: boolean;
  suffix?: string;
  value?: string;
  defaultValue?: string;
  onClear?: () => void;
  ref?: Ref<HTMLInputElement>;
};

type TextFieldProps = TextFieldOwnProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, keyof TextFieldOwnProps>;

const passesAllRules = (rules: TextFieldRule[], value: string) =>
  rules.every(rule => rule.validate(value));

export default function TextField({
  label,
  helperText,
  rules = [],
  error = false,
  suffix,
  value,
  defaultValue = "",
  onChange,
  onBlur,
  onClear,
  ref,
  id,
  required,
  disabled,
  maxLength,
  className,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-help`;

  const {
    elementRef,
    currentValue,
    isOverLimit,
    handleChange: changeValue,
    handleClear: clearValue,
  } = useClearableInput({ value, defaultValue, ref, maxLength, onChange, onClear });
  const hasValue = currentValue.length > 0;
  const isRuleViolated = hasValue && !passesAllRules(rules, currentValue);

  // 규칙 미충족 Error는 포커스가 빠질 때 켜지고, 입력 중 모두 충족하거나 값을 비우면 꺼진다
  const [hasRuleError, setHasRuleError] = useState(false);
  // 제어 모드에서 부모가 값을 바꾸면 change 이벤트가 없으므로 현재 값으로 한 번 더 걸러낸다
  const isError = error || isOverLimit || (hasRuleError && isRuleViolated);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    if (nextValue === "" || passesAllRules(rules, nextValue)) setHasRuleError(false);
    changeValue(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setHasRuleError(isRuleViolated);
    onBlur?.(event);
  };

  const handleClear = () => {
    setHasRuleError(false);
    clearValue();
  };

  const getRuleState = (rule: TextFieldRule): FieldMessageState => {
    if (!hasValue) return "default";
    return rule.validate(currentValue) ? "success" : "error";
  };

  const hasHelpTexts = helperText !== undefined || rules.length > 0;

  return (
    <div className={cn("flex w-full flex-col gap-2", disabled && "opacity-60", className)}>
      <div
        className={cn(
          "group flex flex-col justify-center overflow-clip rounded-3xl border-2 px-5 py-3 transition-colors",
          isError
            ? "border-semantic-border-danger bg-semantic-fill-danger-weak"
            : "bg-semantic-fill-neutral-weak focus-within:border-semantic-border-strong focus-within:bg-semantic-fill-default border-transparent",
        )}>
        <div className="flex items-start gap-0.5 pt-2">
          <label
            htmlFor={inputId}
            className={cn(
              "min-w-0 truncate [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-small-weak)]",
              isError ? "text-semantic-text-danger" : "text-semantic-text-tertiary",
            )}>
            {label}
          </label>
          {required && (
            <span aria-hidden className="bg-semantic-fill-danger size-1 shrink-0 rounded-full" />
          )}
        </div>
        <div className="flex h-10 items-center gap-1">
          <input
            ref={elementRef}
            id={inputId}
            value={currentValue}
            onChange={handleChange}
            onBlur={handleBlur}
            required={required}
            disabled={disabled}
            aria-invalid={isError}
            aria-describedby={hasHelpTexts ? helperId : undefined}
            className={cn(
              "h-full min-w-0 flex-1 bg-transparent outline-none",
              "[letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-medium-weak)]",
              "text-semantic-text-primary placeholder:text-semantic-text-quaternary",
              "disabled:cursor-not-allowed",
            )}
            {...props}
          />
          {!disabled && (hasValue || suffix) && (
            <div className="flex h-full shrink-0 items-center gap-2 pl-2">
              {hasValue && (
                <button
                  type="button"
                  aria-label="입력 내용 지우기"
                  // 클릭 시 input 포커스가 빠지면 focus-within이 풀려 버튼이 먼저 사라지므로 포커스 이동을 막는다
                  onMouseDown={event => event.preventDefault()}
                  onClick={handleClear}
                  className="text-semantic-text-quaternary hidden cursor-pointer group-focus-within:flex">
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
      {(hasHelpTexts || maxLength !== undefined) && (
        <div className="flex items-start">
          <div id={helperId} className="flex min-w-0 flex-1 flex-col gap-2">
            {helperText !== undefined && (
              <FieldMessage state={isError ? "error" : "default"}>{helperText}</FieldMessage>
            )}
            {rules.map(rule => (
              <FieldMessage key={rule.message} state={getRuleState(rule)}>
                {rule.message}
              </FieldMessage>
            ))}
          </div>
          {maxLength !== undefined && (
            <TextCounter length={currentValue.length} maxLength={maxLength} error={isError} />
          )}
        </div>
      )}
    </div>
  );
}
