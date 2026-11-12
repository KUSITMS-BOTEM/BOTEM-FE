import { type ReactNode, useEffect, useRef, useState } from "react";
import { DayPicker, type ChevronProps } from "react-day-picker";
import { ko } from "react-day-picker/locale";
import { BIRTH_YEAR, getInitialDate, parseDateString, toDateString } from "@/utils/date/dateString";
import Asset from "@/components/Asset";
import IconLeft from "@/assets/icons/icon-left.svg?react";
import IconRight from "@/assets/icons/icon-right.svg?react";

type DatePickerPopoverProps = {
  variant: "birth" | "deadline";
  // "YYYY-MM-DD". 비어 있으면 오늘이 선택된 상태로 열린다
  value: string;
  // deadline에서 선택할 수 있는 가장 이른 날짜("YYYY-MM-DD"). 없으면 오늘
  minDate?: string;
  onSelect: (date: string) => void;
  disabled?: boolean;
  // 트리거 아이콘 버튼에 전달된다
  triggerProps: {
    id?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
  };
  children: ReactNode;
};

const CLASS_NAMES = {
  months: "relative",
  month_caption: "flex h-5 items-center justify-center",
  caption_label: "text-semantic-text-strong [font:var(--semantic-label-x-small)]",
  nav: "absolute inset-x-0 top-0 flex h-5 items-center justify-between",
  button_previous:
    "text-semantic-icon-primary hover:bg-semantic-fill-neutral-weak flex size-5 cursor-pointer items-center justify-center rounded-full aria-disabled:pointer-events-none aria-disabled:opacity-30",
  button_next:
    "text-semantic-icon-primary hover:bg-semantic-fill-neutral-weak flex size-5 cursor-pointer items-center justify-center rounded-full aria-disabled:pointer-events-none aria-disabled:opacity-30",
  month_grid: "mt-1 border-collapse",
  weekday: "text-semantic-text-quaternary size-5 text-center [font:var(--semantic-subtext-small)]",
  day: "p-0 text-center",
  day_button:
    "text-semantic-text-primary hover:bg-semantic-fill-neutral-weak flex size-5 cursor-pointer items-center justify-center rounded-full [font:var(--semantic-subtext-small)]",
  today: "[&>button]:underline",
  selected:
    "[&>button]:bg-semantic-fill-brand! [&>button]:text-semantic-text-on-fill! [&>button]:cursor-default",
  disabled: "[&>button]:text-semantic-text-quaternary [&>button]:pointer-events-none opacity-40",
  hidden: "invisible",
};

function Chevron({ orientation }: ChevronProps) {
  const Icon = orientation === "left" ? IconLeft : IconRight;
  return <Asset icon={<Icon aria-hidden />} size="xsmall" />;
}

export default function DatePickerPopover({
  variant,
  value,
  minDate,
  onSelect,
  disabled,
  triggerProps,
  children,
}: DatePickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const isBirth = variant === "birth";

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const earliest = (minDate && parseDateString(minDate)) || new Date();
  const picked = getInitialDate(value, isBirth ? undefined : earliest);
  const selected = isBirth ? new Date(BIRTH_YEAR, picked.getMonth(), picked.getDate()) : picked;
  const disabledDates = isBirth ? [] : [{ before: earliest }];

  const handleSelect = (date: Date) => {
    onSelect(toDateString(date));
    setOpen(false);
  };

  return (
    <span ref={containerRef} className="relative size-6 shrink-0">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(prev => !prev)}
        className="size-full cursor-pointer disabled:cursor-not-allowed"
        {...triggerProps}>
        {children}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={isBirth ? "생일 선택" : "마감일 선택"}
          className="bg-semantic-background-floated absolute top-full right-0 z-10 mt-2 w-fit rounded-xl p-2 shadow-[0_4px_16px_var(--color-semantic-shadow-default)]">
          <DayPicker
            mode="single"
            required
            autoFocus
            locale={ko}
            selected={selected}
            onSelect={handleSelect}
            classNames={CLASS_NAMES}
            components={{ Chevron }}
            defaultMonth={selected}
            disabled={disabledDates}
            {...(isBirth
              ? {
                  startMonth: new Date(BIRTH_YEAR, 0),
                  endMonth: new Date(BIRTH_YEAR, 11),
                  formatters: { formatCaption: (month: Date) => `${month.getMonth() + 1}월` },
                }
              : { startMonth: earliest })}
          />
        </div>
      )}
    </span>
  );
}
