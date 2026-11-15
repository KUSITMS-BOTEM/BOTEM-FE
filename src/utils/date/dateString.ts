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

// 값이 없으면 오늘을 보여준다. 오늘이 min보다 이르거나 max보다 늦어 선택할 수 없으면 가까운 쪽 경계
export function getInitialDate(value: string, min?: Date, max?: Date): Date {
  const parsed = parseDateString(value);
  if (parsed) return parsed;
  const now = new Date();
  if (min && min > now) return min;
  if (max && max < now) return max;
  return now;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// 월 전환으로 없는 날(예: 3/31 → 2월)이 되면 그 달 말일로 맞추고, min보다 이르면 min으로 올리고 max보다 늦으면 max로 내린다
export function clampDate(year: number, month: number, day: number, min?: Date, max?: Date): Date {
  const date = new Date(year, month - 1, Math.min(day, getDaysInMonth(year, month)));
  if (min && date < min) return min;
  if (max && date > max) return max;
  return date;
}
