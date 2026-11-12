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
