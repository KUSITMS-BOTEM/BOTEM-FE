export type DepositItem = {
  id: number;
  senderName: string;
  depositedAt: string;
};

export type DepositGroup = {
  dateLabel: string;
  deposits: DepositItem[];
};

export type DepositAction = "received" | "notReceived";

const pad = (value: number) => String(value).padStart(2, "0");

// 파싱이 안 되는 값은 빈 문자열로 둔다 (formatContributedDate와 같은 방침)
export const formatDepositDate = (depositedAt: string) => {
  const date = new Date(depositedAt);
  return Number.isNaN(date.getTime()) ? "" : `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

export const formatDepositTime = (depositedAt: string) => {
  const date = new Date(depositedAt);
  return Number.isNaN(date.getTime()) ? "" : `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// 입력 순서(최신순)를 그대로 유지하면서 같은 날짜끼리 묶는다
export const groupDepositsByDate = (deposits: DepositItem[]): DepositGroup[] => {
  const groups: DepositGroup[] = [];
  for (const deposit of deposits) {
    const dateLabel = formatDepositDate(deposit.depositedAt);
    const last = groups.at(-1);
    if (last?.dateLabel === dateLabel) last.deposits.push(deposit);
    else groups.push({ dateLabel, deposits: [deposit] });
  }
  return groups;
};

export const getDepositToastText = (action: DepositAction, processed: number, total: number) => {
  const isAll = processed === total;
  if (action === "received") {
    return isAll ? "모든 건의 입금을 확인했어요" : `${processed}건의 입금을 모두 확인했어요`;
  }
  return isAll ? "모든 건의 입금을 못받음 처리했어요" : `${processed}건의 입금을 못받음 처리했어요`;
};
