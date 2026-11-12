import { useState } from "react";
import Picker from "react-mobile-picker";
import {
  BIRTH_YEAR,
  clampDate,
  getDaysInMonth,
  parseDateString,
  toDateString,
} from "@/utils/date/dateString";
import BottomSheet from "@/components/BottomSheet";

// 마감일 년 휠은 minDate 연도부터 이 연도까지 보여준다
const MAX_DEADLINE_YEAR = 2099;

type DateWheelSheetProps = {
  variant: "birth" | "deadline";
  open: boolean;
  // "YYYY-MM-DD". 비어 있으면 오늘(minDate가 더 늦으면 minDate)로 열린다
  value: string;
  // deadline에서 고를 수 있는 가장 이른 날짜("YYYY-MM-DD"). 없으면 오늘
  minDate?: string;
  onSelect: (date: string) => void;
  onClose: () => void;
};

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

export default function DateWheelSheet({
  variant,
  open,
  value,
  minDate,
  onSelect,
  onClose,
}: DateWheelSheetProps) {
  const isBirth = variant === "birth";
  const now = new Date();
  const earliest = isBirth ? undefined : (minDate && parseDateString(minDate)) || now;
  const initial = parseDateString(value) ?? (earliest && earliest > now ? earliest : now);
  const initialDate = clampDate(
    isBirth ? BIRTH_YEAR : initial.getFullYear(),
    initial.getMonth() + 1,
    initial.getDate(),
    earliest,
  );

  const [draft, setDraft] = useState(initialDate);
  const [prevOpen, setPrevOpen] = useState(open);
  // 열 때마다 현재 값으로 되돌린다. 닫을 때 바꾸면 퇴장 모션 중 휠이 튄다
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setDraft(initialDate);
  }

  const year = draft.getFullYear();
  const month = draft.getMonth() + 1;
  const day = draft.getDate();
  const isMinYear = earliest?.getFullYear() === year;
  const isMinMonth = isMinYear && earliest.getMonth() + 1 === month;
  const years = earliest ? range(earliest.getFullYear(), MAX_DEADLINE_YEAR) : [];
  const months = range(isMinYear ? earliest.getMonth() + 1 : 1, 12);
  const days = range(isMinMonth ? earliest.getDate() : 1, getDaysInMonth(year, month));

  const handleChange = (next: Record<string, string>) =>
    setDraft(clampDate(Number(next.year), Number(next.month), Number(next.day), earliest));

  const columns = [
    ...(isBirth ? [] : [{ name: "year", options: years, unit: "년" }]),
    { name: "month", options: months, unit: "월" },
    { name: "day", options: days, unit: "일" },
  ];

  return (
    <BottomSheet
      open={open}
      title={isBirth ? "생일 선택" : "마감일 선택"}
      height="auto"
      onClose={onClose}
      buttons={{
        rightLabel: "확인",
        onRightClick: () => {
          onSelect(toDateString(draft));
          onClose();
        },
      }}>
      <div className="relative w-full">
        <div
          aria-hidden
          className="bg-semantic-fill-neutral-weak pointer-events-none absolute inset-x-0 top-1/2 h-9 -translate-y-1/2 rounded-xl"
        />
        <Picker
          value={{ year: String(year), month: String(month), day: String(day) }}
          onChange={handleChange}
          wheelMode="natural">
          {columns.map(({ name, options, unit }) => (
            <Picker.Column key={name} name={name}>
              {options.map(option => (
                <Picker.Item key={option} value={String(option)}>
                  {({ selected }) => (
                    <span
                      className={
                        selected
                          ? "text-semantic-text-primary [font:var(--semantic-label-medium-weak)]"
                          : "text-semantic-text-quaternary [font:var(--semantic-label-medium-weak)]"
                      }>
                      {option}
                      {unit}
                    </span>
                  )}
                </Picker.Item>
              ))}
            </Picker.Column>
          ))}
        </Picker>
      </div>
    </BottomSheet>
  );
}
