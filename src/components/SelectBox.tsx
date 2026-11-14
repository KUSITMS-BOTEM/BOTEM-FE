import {
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type HTMLAttributes,
  type ReactNode,
  useId,
  useState,
} from "react";
import { cn } from "@/utils/cn";
import Asset from "@/components/Asset";
import FieldMessage from "@/components/FieldMessage";
import IconDown from "@/assets/icons/icon-down.svg?react";
import IconCalendar from "@/assets/icons/icon-calendar.svg?react";

type SelectBoxVariant = "select" | "birth" | "deadline";

const VARIANT_ICON: Record<SelectBoxVariant, typeof IconDown> = {
  select: IconDown,
  birth: IconCalendar,
  deadline: IconCalendar,
};

type SelectBoxOwnProps = {
  variant?: SelectBoxVariant;
  label: string;
  value?: string;
  placeholder?: string;
  helperText?: ReactNode;
  onDateChange?: (month: number | null, day: number | null) => void;
  onDeadlineChange?: (date: string) => void;
  minDate?: string;
  // 날짜 선택 variant에서 고를 수 있는 가장 늦은 날짜("YYYY-MM-DD").
  maxDate?: string;
  dateValue?: string;
};

type SelectBoxProps = SelectBoxOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof SelectBoxOwnProps | "children">;

// 옵션 목록은 디자인이 없어 트리거만 담당하고, 열기 동작은 onClick으로 사용처에서 처리한다 (variant="birth"는 예외 — 기기 기본 캘린더를 직접 띄운다)
export default function SelectBox({
  variant = "select",
  label,
  value,
  placeholder = "선택해주세요",
  helperText,
  onDateChange,
  onDeadlineChange,
  minDate,
  maxDate,
  dateValue = "",
  id,
  disabled,
  className,
  ...props
}: SelectBoxProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const labelId = `${controlId}-label`;
  const valueId = `${controlId}-value`;
  const helperTextId = `${controlId}-help`;
  const isFilled = value !== undefined && value !== "";
  const Icon = VARIANT_ICON[variant];
  const hasDatePicker = variant !== "select";
  // 화면엔 월·일만 보여주지만, 같은 세션에서 다시 열었을 때 이전에 고른 연도까지 캘린더에 남아있도록 내부적으로만 기억한다
  const [pickedDate, setPickedDate] = useState(dateValue);

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPickedDate(event.target.value);
    if (variant === "deadline") {
      onDeadlineChange?.(event.target.value);
      return;
    }
    const [, month, day] = event.target.value.split("-").map(Number);
    onDateChange?.(month || null, day || null);
  };

  const triggerContent = (
    <>
      <span
        id={labelId}
        className="text-semantic-text-tertiary max-w-full truncate pt-2 [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-small-weak)]">
        {label}
      </span>
      <span className="flex h-[38px] w-full items-center">
        <span
          id={valueId}
          className={cn(
            "min-w-0 flex-1 truncate [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-medium-weak)]",
            isFilled ? "text-semantic-text-primary" : "text-semantic-text-quaternary",
          )}>
          {isFilled ? value : placeholder}
        </span>
        {hasDatePicker ? (
          <span className="relative size-6 shrink-0">
            <Asset
              icon={<Icon aria-hidden />}
              size="medium"
              className="text-semantic-icon-secondary"
            />
            <input
              type="date"
              id={controlId}
              value={pickedDate}
              min={minDate}
              max={maxDate}
              disabled={disabled}
              onChange={handleDateChange}
              aria-labelledby={`${labelId} ${valueId}`}
              aria-describedby={helperText !== undefined ? helperTextId : undefined}
              className="absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            />
          </span>
        ) : (
          <Asset
            icon={<Icon aria-hidden />}
            size="medium"
            className="text-semantic-icon-secondary"
          />
        )}
      </span>
    </>
  );

  return (
    <div className={cn("flex w-full flex-col gap-2", disabled && "opacity-60", className)}>
      {hasDatePicker ? (
        <div
          className="bg-semantic-fill-neutral-weak flex w-full flex-col items-start justify-center overflow-clip rounded-3xl border-2 border-transparent px-5 py-3"
          {...(props as HTMLAttributes<HTMLDivElement>)}>
          {triggerContent}
        </div>
      ) : (
        <button
          type="button"
          id={controlId}
          disabled={disabled}
          aria-labelledby={`${labelId} ${valueId}`}
          aria-describedby={helperText !== undefined ? helperTextId : undefined}
          className="bg-semantic-fill-neutral-weak flex w-full cursor-pointer flex-col items-start justify-center overflow-clip rounded-3xl border-2 border-transparent px-5 py-3 text-left disabled:cursor-not-allowed"
          {...props}>
          {triggerContent}
        </button>
      )}
      {helperText !== undefined && <FieldMessage id={helperTextId}>{helperText}</FieldMessage>}
    </div>
  );
}
