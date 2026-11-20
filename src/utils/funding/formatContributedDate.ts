import { parseDateString, toDateString } from "@/utils/date/dateString";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// UTC(Z)로 와도 로컬 날짜로 맞추도록 Date로 파싱하고, 파싱이 안 되는 값은 날짜를 비운다
// yyyy-MM-dd만 오면 new Date가 UTC로 해석해 시간대에 따라 하루 밀리므로 로컬 날짜로 직접 만든다
export const formatContributedDate = (contributedAt: string) => {
  const date = DATE_ONLY_PATTERN.test(contributedAt)
    ? parseDateString(contributedAt)
    : new Date(contributedAt);
  return !date || Number.isNaN(date.getTime()) ? "" : toDateString(date).replaceAll("-", ".");
};
