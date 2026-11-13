import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  useId,
  useState,
} from "react";
import { cn } from "@/utils/cn";
import { BIRTH_YEAR } from "@/utils/date/dateString";
import { useIsCoarsePointer } from "@/hooks/useIsCoarsePointer";
import Asset from "@/components/Asset";
import DatePickerPopover from "@/components/DatePickerPopover";
import DateWheelSheet from "@/components/DateWheelSheet";
import FieldMessage from "@/components/FieldMessage";
import IconDown from "@/assets/icons/icon-down.svg?react";
import IconCalendar from "@/assets/icons/icon-calendar.svg?react";

// birth의 "MM-DD"를 달력이 쓰는 "YYYY-MM-DD"로 맞춘다
const toPickerDate = (variant: SelectBoxVariant, date: string) =>
  variant === "birth" && /^\d{2}-\d{2}$/.test(date) ? `${BIRTH_YEAR}-${date}` : date;

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
  // variant="birth"에서만 쓰인다. 기기 기본 캘린더로 고른 날짜의 연도를 뺀 월·일만 전달한다. 날짜를 지우면 둘 다 null로 전달된다.
  onDateChange?: (month: number | null, day: number | null) => void;
  // variant="deadline"에서만 쓰인다. 연도를 포함한 날짜를 "YYYY-MM-DD"로 전달하고, 날짜를 지우면 빈 문자열이다.
  onDeadlineChange?: (date: string) => void;
  // 날짜 선택 variant에서 고를 수 있는 가장 이른 날짜("YYYY-MM-DD"). 이전 날짜는 캘린더에서 선택할 수 없다.
  minDate?: string;
  // 날짜 선택 variant에서 캘린더에 선택돼 있을 날짜. deadline은 "YYYY-MM-DD", birth는 "MM-DD". 이미 정해진 값이 있을 때 넘긴다.
  // 사용자가 아직 날짜를 고르지 않았다면 이 값을 따라가므로 프로필처럼 비동기로 도착하는 값도 반영된다.
  dateValue?: string;
};

type SelectBoxProps = SelectBoxOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof SelectBoxOwnProps | "children">;

// 옵션 목록은 디자인이 없어 트리거만 담당하고, 열기 동작은 onClick으로 사용처에서 처리한다 (날짜 variant는 예외 — 마우스는 달력 팝오버, 터치는 휠 피커 시트를 직접 띄운다)
export default function SelectBox({
  variant = "select",
  label,
  value,
  placeholder = "선택해주세요",
  helperText,
  onDateChange,
  onDeadlineChange,
  minDate,
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
  // 화면엔 월·일만 보여주지만, 같은 세션에서 다시 열었을 때 이전에 고른 연도까지 캘린더에 남아있도록 내부적으로만 기억한다. null이면 아직 고르지 않은 상태
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const currentDate = pickedDate ?? toPickerDate(variant, dateValue);

  const isCoarsePointer = useIsCoarsePointer();
  const [wheelOpen, setWheelOpen] = useState(false);

  const applyDate = (date: string) => {
    setPickedDate(date);
    if (variant === "deadline") {
      onDeadlineChange?.(date);
      return;
    }
    const [, month, day] = date.split("-").map(Number);
    onDateChange?.(month || null, day || null);
  };

  const dateAria = {
    id: controlId,
    "aria-labelledby": `${labelId} ${valueId}`,
    "aria-describedby": helperText !== undefined ? helperTextId : undefined,
  };
  const dateIcon = (
    <Asset icon={<Icon aria-hidden />} size="medium" className="text-semantic-icon-secondary" />
  );

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
        {variant !== "select" && !isCoarsePointer ? (
          <DatePickerPopover
            variant={variant}
            value={currentDate}
            minDate={minDate}
            onSelect={applyDate}
            disabled={disabled}
            triggerProps={dateAria}>
            {dateIcon}
          </DatePickerPopover>
        ) : hasDatePicker ? (
          <button
            type="button"
            disabled={disabled}
            aria-haspopup="dialog"
            onClick={() => setWheelOpen(true)}
            className="size-6 shrink-0 cursor-pointer disabled:cursor-not-allowed"
            {...dateAria}>
            {dateIcon}
          </button>
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
          className="bg-semantic-fill-neutral-weak flex w-full flex-col items-start justify-center rounded-3xl border-2 border-transparent px-5 py-3"
          // button 전용 attrs(type 등)를 제외하면 div와 호환되는 공통 DOM attrs만 남는다
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
      {hasDatePicker && isCoarsePointer && (
        <DateWheelSheet
          variant={variant}
          open={wheelOpen}
          value={currentDate}
          minDate={minDate}
          onSelect={applyDate}
          onClose={() => setWheelOpen(false)}
        />
      )}
      {helperText !== undefined && <FieldMessage id={helperTextId}>{helperText}</FieldMessage>}
    </div>
  );
}
