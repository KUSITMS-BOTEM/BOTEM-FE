// "2026-12-25" → "2026.12.25 (금)". 빈 값은 그대로 빈 문자열
export const formatDeadline = (date: string) => {
  if (!date) return "";
  const weekday = new Date(`${date}T00:00:00`).toLocaleDateString("ko-KR", { weekday: "short" });
  return `${date.replace(/-/g, ".")} (${weekday})`;
};

// "2026-11-13" → "11월 13일"
export const formatDeadlineShort = (date: string) => {
  const [, month, day] = date.split("-");
  return `${Number(month)}월 ${Number(day)}일`;
};

// 기기 로컬 기준 오늘 날짜를 "YYYY-MM-DD"로 만든다 (sv-SE 로케일이 이 형식)
export const getTodayDate = () => new Date().toLocaleDateString("sv-SE");
