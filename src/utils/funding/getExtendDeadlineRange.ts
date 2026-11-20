import { addDays } from "@/utils/funding/addDays";

export const MAX_EXTEND_DAYS = 14;

// BE는 새 마감일이 기존 마감일·현재 시각 이후이고 요청일로부터 14일 이내여야 받는다(FUNDING_040·041).
// 마감 후에 여는 시트라 기존 마감일 기준으로 범위를 잡으면 지난 날짜가 섞인다
export const getExtendDeadlineRange = (currentDeadline: string, today: string) => {
  const dayAfterDeadline = addDays(currentDeadline, 1);
  return {
    minDate: dayAfterDeadline > today ? dayAfterDeadline : today,
    maxDate: addDays(today, MAX_EXTEND_DAYS),
  };
};
