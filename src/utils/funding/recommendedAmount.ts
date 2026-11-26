const HEADCOUNTS = [5, 10, 20];
const AMOUNT_UNIT = 1000;

export type RecommendedAmountOption = { amount: number; headcount: number };

export const countFunders = (targetAmount: number, amount: number) =>
  Math.ceil(targetAmount / amount);

export const formatPerPerson = (amount: number | string) =>
  `한 명당 ${Number(amount).toLocaleString("ko-KR")}원씩`;

// 목표 금액을 5·10·20명이 나눌 때의 1인 금액을 천원 단위로 올림한다. 올림하면 같아지거나 목표를 넘는 값은 뺀다
export function toRecommendedAmountOptions(targetAmount: number): RecommendedAmountOption[] {
  if (!(targetAmount > 0)) return [];
  const amounts = HEADCOUNTS.map(
    headcount => Math.ceil(targetAmount / headcount / AMOUNT_UNIT) * AMOUNT_UNIT,
  ).filter(amount => amount <= targetAmount);
  return [...new Set(amounts)].map(amount => ({
    amount,
    headcount: countFunders(targetAmount, amount),
  }));
}
