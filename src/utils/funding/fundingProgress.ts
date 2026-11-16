import { isDeadlinePassed } from "@/utils/funding/getDDayLabel";

// 소수점은 내림, 100은 넘기지 않는다. 99.9%가 100%로 보여 완성처럼 읽히는 걸 막는다
export function calcFundingPercent(currentAmount: number, targetAmount: number) {
  if (targetAmount <= 0) return 0;
  return Math.min(100, Math.floor((currentAmount / targetAmount) * 100));
}

// 달성률 하한 기준 구간. 큰 하한부터 처음 만족하는 문구를 쓴다
const PROGRESS_MESSAGES = [
  [95, "곧 보탬이 완성돼요!"],
  [80, "거의 다 모았어요!"],
  [60, "절반이 넘었어요!"],
  [40, "점점 채워지고 있어요."],
  [20, "좋은 출발이에요."],
  [0, "첫 보탬을 기다려요."],
] as const;

type ClosedLabelParams = { currentAmount: number; targetAmount: number; deadline: string };

// 금액을 다 채우면 "마감", 아니고 기간이 지났으면 "기간 마감", 진행 중이면 null
export function getClosedLabel({ currentAmount, targetAmount, deadline }: ClosedLabelParams) {
  if (targetAmount > 0 && currentAmount >= targetAmount) return "마감";
  return isDeadlinePassed(deadline) ? "기간 마감" : null;
}

export function getFundingProgressMessage(percent: number) {
  const matched = PROGRESS_MESSAGES.find(([min]) => percent >= min);
  return matched ? matched[1] : PROGRESS_MESSAGES[PROGRESS_MESSAGES.length - 1][1];
}
