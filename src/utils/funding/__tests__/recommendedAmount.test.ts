import {
  countFunders,
  formatPerPerson,
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
