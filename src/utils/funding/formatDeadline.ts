// "2026-12-25" → "2026.12.25 (금)". 빈 값은 그대로 빈 문자열
export const formatDeadline = (date: string) => {
  if (!date) return "";
  const weekday = new Date(`${date}T00:00:00`).toLocaleDateString("ko-KR", { weekday: "short" });
  return `${date.replace(/-/g, ".")} (${weekday})`;
};

// "2026-11-13" · "2026-11-13T23:59:59" → "11월 13일". 서버가 마감일을 시각까지 붙여 내려줘도 날짜 부분만 쓴다
export const formatDeadlineShort = (date: string) => {
  const [, month, day] = date.slice(0, 10).split("-");
  return `${Number(month)}월 ${Number(day)}일`;
};

// "2026-10-13T00:00:00" → "10월 13일 0시"
export const formatRevealLabel = (dateTime: string) =>
  `${formatDeadlineShort(dateTime.slice(0, 10))} ${Number(dateTime.slice(11, 13))}시`;

// 기기 로컬 기준 오늘 날짜를 "YYYY-MM-DD"로 만든다 (sv-SE 로케일이 이 형식)
export const getTodayDate = () => new Date().toLocaleDateString("sv-SE");
