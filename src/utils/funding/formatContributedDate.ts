import { toDateString } from "@/utils/date/dateString";

// UTC(Z)로 와도 로컬 날짜로 맞추도록 Date로 파싱하고, 파싱이 안 되는 값은 날짜를 비운다
export const formatContributedDate = (contributedAt: string) => {
  const date = new Date(contributedAt);
  return Number.isNaN(date.getTime()) ? "" : toDateString(date).replaceAll("-", ".");
};
