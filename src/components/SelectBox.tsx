import { type ButtonHTMLAttributes, type ReactNode, useId } from "react";
import { cn } from "@/utils/cn";
import Asset from "@/components/Asset";
import FieldMessage from "@/components/FieldMessage";
import IconDown from "@/assets/icons/icon-down.svg?react";
import IconCalendar from "@/assets/icons/icon-calendar.svg?react";

type SelectBoxVariant = "select" | "birth";

const VARIANT_ICON: Record<SelectBoxVariant, typeof IconDown> = {
  select: IconDown,
  birth: IconCalendar,
};

type SelectBoxOwnProps = {
  variant?: SelectBoxVariant;
  label: string;
  value?: string;
  placeholder?: string;
  helperText?: ReactNode;
};

type SelectBoxProps = SelectBoxOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof SelectBoxOwnProps | "children">;

// 옵션 목록은 디자인이 없어 트리거만 담당하고, 열기 동작은 onClick으로 사용처에서 처리한다
export default function SelectBox({
  variant = "select",
  label,
  value,
  placeholder = "선택해주세요",
  helperText,
  id,
  disabled,
  className,
  ...props
}: SelectBoxProps) {
  const generatedId = useId();
  const buttonId = id ?? generatedId;
  const labelId = `${buttonId}-label`;
  const valueId = `${buttonId}-value`;
  const helperTextId = `${buttonId}-help`;
  const isFilled = value !== undefined && value !== "";
  const Icon = VARIANT_ICON[variant];

  return (
    <div className={cn("flex w-full flex-col gap-2", disabled && "opacity-60", className)}>
      <button
        type="button"
        id={buttonId}
        disabled={disabled}
        aria-labelledby={`${labelId} ${valueId}`}
        aria-describedby={helperText !== undefined ? helperTextId : undefined}
        className="bg-semantic-fill-neutral-weak flex w-full cursor-pointer flex-col items-start justify-center overflow-clip rounded-3xl border-2 border-transparent px-5 py-3 text-left disabled:cursor-not-allowed"
        {...props}>
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
          <Asset icon={<Icon aria-hidden />} size="medium" className="text-semantic-icon-default" />
        </span>
      </button>
      {helperText !== undefined && <FieldMessage id={helperTextId}>{helperText}</FieldMessage>}
    </div>
  );
}
