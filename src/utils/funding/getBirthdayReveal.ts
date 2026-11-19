import { addDays } from "@/utils/funding/addDays";

// 생일 공개일과 그 전날을 마감일로 잡을 수 있는지 계산한다. 생일 정보가 없으면 둘 다 비운다
export const getBirthdayReveal = (
  today: string,
  birthday?: string | null,
  birthdayDday?: number | null,
) => {
  if (!birthday || birthdayDday == null) return { revealDate: undefined, canUse: false };
  const revealDate = addDays(today, birthdayDday);
  // 생일 전날이 오늘보다 앞이면(생일이 오늘이면) 마감일을 만들 수 없다
  return { revealDate, canUse: addDays(revealDate, -1) >= today };
};
