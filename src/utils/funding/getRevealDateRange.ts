import { addDays } from "@/utils/funding/addDays";

export const MAX_REVEAL_DAYS_AFTER_DEADLINE = 30;

// 공개일은 마감일 다음 날부터 30일 안에서 고를 수 있다
export const getRevealDateRange = (deadline: string) => ({
  minDate: addDays(deadline, 1),
  maxDate: addDays(deadline, MAX_REVEAL_DAYS_AFTER_DEADLINE),
});
