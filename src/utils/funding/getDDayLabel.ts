import { parseDateString } from "@/utils/date/dateString";
import { getTodayDate } from "@/utils/funding/formatDeadline";

const DAY_MS = 24 * 60 * 60 * 1000;

// 오늘 기준 남은 일수. 날짜 형식이 틀리면 null
function getDaysLeft(deadline: string) {
  const target = parseDateString(deadline);
  const today = parseDateString(getTodayDate());
  if (!target || !today) return null;

  // 서머타임 전환일은 하루가 23·25시간이라 나눈 뒤 반올림한다
  return Math.round((target.getTime() - today.getTime()) / DAY_MS);
}

// "2026-11-20" → 오늘 기준 "D-4" / 당일 "D-Day" / 지난 날짜 "D-0". 날짜 형식이 틀리면 빈 문자열
export function getDDayLabel(deadline: string) {
  const diff = getDaysLeft(deadline);
  if (diff === null) return "";
  if (diff > 0) return `D-${diff}`;
  return diff === 0 ? "D-Day" : "D-0";
}

export function isDeadlinePassed(deadline: string) {
  const diff = getDaysLeft(deadline);
  return diff !== null && diff < 0;
}
