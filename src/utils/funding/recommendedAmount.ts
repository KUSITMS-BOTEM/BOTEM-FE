const HEADCOUNTS = [5, 10, 20];
const AMOUNT_UNIT = 1000;
const DEFAULT_CONTRIBUTE_AMOUNTS = [5000, 10000, 50000];

export const CUSTOM_CHOICE = "custom";

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

// 기본 금액 사이에 추천 금액을 금액순으로 끼우고, 같은 금액이면 하나만 남긴다
export const toContributeAmounts = (recommendedAmount?: number) =>
  [
    ...new Set(
      recommendedAmount
        ? [...DEFAULT_CONTRIBUTE_AMOUNTS, recommendedAmount]
        : DEFAULT_CONTRIBUTE_AMOUNTS,
    ),
  ].sort((a, b) => a - b);

// 확정된 추천 금액이 선택지에 있으면 그 선택을, 없으면 직접 입력을 복원한다
export function restoreRecommendedChoice(options: RecommendedAmountOption[], value: string) {
  const matched = options.some(option => String(option.amount) === value);
  return {
    choice: matched ? value : value ? CUSTOM_CHOICE : null,
    custom: matched ? "" : value,
  };
}

export function toCustomAmountState(custom: string, targetAmount: number) {
  const customAmount = Number(custom);
  const isOverTarget = customAmount > targetAmount;
  return { customAmount, isOverTarget, isValid: customAmount >= 1 && !isOverTarget };
}
