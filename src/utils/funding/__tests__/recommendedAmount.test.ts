import {
  countFunders,
  formatPerPerson,
  restoreRecommendedChoice,
  toContributeAmounts,
  toCustomAmountState,
  toRecommendedAmountOptions,
} from "@/utils/funding/recommendedAmount";

describe("toRecommendedAmountOptions", () => {
  it("목표 금액을 5·10·20명으로 나눠 천원 단위로 올림하고 모이는 인원을 역산한다", () => {
    expect(toRecommendedAmountOptions(468000)).toEqual([
      { amount: 94000, headcount: 5 },
      { amount: 47000, headcount: 10 },
      { amount: 24000, headcount: 20 },
    ]);
  });

  it("올림한 금액이 같아지면 하나만 남긴다", () => {
    expect(toRecommendedAmountOptions(10000)).toEqual([
      { amount: 2000, headcount: 5 },
      { amount: 1000, headcount: 10 },
    ]);
  });

  it("올림한 금액이 목표 금액을 넘으면 뺀다", () => {
    expect(toRecommendedAmountOptions(500)).toEqual([]);
  });

  it("목표 금액이 0 이하면 선택지가 없다", () => {
    expect(toRecommendedAmountOptions(0)).toEqual([]);
  });
});

describe("countFunders", () => {
  it("목표를 채우는 데 필요한 인원을 올림한다", () => {
    expect(countFunders(468000, 25000)).toBe(19);
  });
});

describe("formatPerPerson", () => {
  it("문자열·숫자 모두 천 단위 쉼표로 보여준다", () => {
    expect(formatPerPerson("50000")).toBe("한 명당 50,000원씩");
    expect(formatPerPerson(50000)).toBe("한 명당 50,000원씩");
  });
});

describe("toContributeAmounts", () => {
  it("추천 금액이 없으면 기본 금액만 돌려준다", () => {
    expect(toContributeAmounts()).toEqual([5000, 10000, 50000]);
  });

  it("추천 금액을 금액순으로 끼운다", () => {
    expect(toContributeAmounts(20000)).toEqual([5000, 10000, 20000, 50000]);
  });

  it("기본 금액과 같으면 하나만 남긴다", () => {
    expect(toContributeAmounts(10000)).toEqual([5000, 10000, 50000]);
  });
});

describe("restoreRecommendedChoice", () => {
  const options = [{ amount: 47000, headcount: 10 }];

  it("확정값이 선택지에 있으면 그 선택을 복원한다", () => {
    expect(restoreRecommendedChoice(options, "47000")).toEqual({ choice: "47000", custom: "" });
  });

  it("선택지에 없으면 직접 입력으로 복원한다", () => {
    expect(restoreRecommendedChoice(options, "3000")).toEqual({ choice: "custom", custom: "3000" });
  });

  it("확정값이 없으면 선택하지 않은 상태다", () => {
    expect(restoreRecommendedChoice(options, "")).toEqual({ choice: null, custom: "" });
  });
});

describe("toCustomAmountState", () => {
  it("1 이상 목표 금액 이하만 유효하다", () => {
    expect(toCustomAmountState("1000", 5000).isValid).toBe(true);
    expect(toCustomAmountState("5000", 5000).isValid).toBe(true);
    expect(toCustomAmountState("0", 5000).isValid).toBe(false);
    expect(toCustomAmountState("", 5000).isValid).toBe(false);
  });

  it("목표 금액을 넘으면 초과로 판정한다", () => {
    expect(toCustomAmountState("5001", 5000)).toMatchObject({ isOverTarget: true, isValid: false });
  });
});
