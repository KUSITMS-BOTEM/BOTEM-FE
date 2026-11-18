import { getFundingResultCopy } from "@/utils/funding/fundingResultCopy";

const base = {
  goalAchieved: true,
  collectedAmount: 364000,
  productPrice: 364000,
  giftChanged: false,
};

describe("getFundingResultCopy", () => {
  it("목표 달성이면 모인 금액 제목과 상품 가격을 보여준다", () => {
    expect(getFundingResultCopy(base)).toEqual({
      title: "364,000원이\n모두 모였어요\n선물을 사러갈까요?",
      productTitle: "364,000원",
      productDescription: "나의 위시 상품",
    });
  });

  it("목표 미달이면 차액 안내를 보여준다", () => {
    expect(getFundingResultCopy({ ...base, goalAchieved: false, collectedAmount: 236000 })).toEqual(
      {
        title: "236,000원이\n모였어요\n어떻게 할까요?",
        productTitle: "차액 128,000원만\n보태면 구매할 수 있어요",
        productDescription: "기존 선물",
      },
    );
  });

  it("다른 선물로 바꿨으면 '변경한 선물'로 표시한다", () => {
    expect(
      getFundingResultCopy({ ...base, goalAchieved: false, giftChanged: true }).productDescription,
    ).toBe("변경한 선물");
  });

  it("미달인데 모인 금액이 가격보다 많아도 차액은 음수가 아니라 0원이다", () => {
    expect(
      getFundingResultCopy({ ...base, goalAchieved: false, collectedAmount: 374000 }).productTitle,
    ).toBe("차액 0원만\n보태면 구매할 수 있어요");
  });
});
