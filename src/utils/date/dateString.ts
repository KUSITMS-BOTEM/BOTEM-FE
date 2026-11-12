// 생일은 연도가 없으므로 2/29도 고를 수 있게 윤년으로 고정한다
export const BIRTH_YEAR = 2000;

const pad = (value: number) => String(value).padStart(2, "0");

export function toDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// new Date("YYYY-MM-DD")는 UTC로 해석돼 시간대에 따라 하루 밀리므로 로컬 자정으로 직접 만든다
export function parseDateString(value: string): Date | undefined {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

// 값이 없으면 오늘을 보여준다. min이 오늘보다 늦으면 선택 불가한 오늘 대신 min
export function getInitialDate(value: string, min?: Date): Date {
  const now = new Date();
  return parseDateString(value) ?? (min && min > now ? min : now);
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// 월 전환으로 없는 날(예: 3/31 → 2월)이 되면 그 달 말일로 맞추고, min보다 이르면 min으로 올린다
export function clampDate(year: number, month: number, day: number, min?: Date): Date {
  const date = new Date(year, month - 1, Math.min(day, getDaysInMonth(year, month)));
  return min && date < min ? min : date;
}
