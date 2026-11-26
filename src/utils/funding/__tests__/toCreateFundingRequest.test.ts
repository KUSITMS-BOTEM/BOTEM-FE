import { toCreateFundingRequest } from "@/utils/funding/toCreateFundingRequest";

const account = { bank: "KB_KOOKMIN", accountNumber: "123-456" } as const;
const info = { targetAmount: "50000", deadline: "2026-12-31", story: "사연", pledge: "공약" };

describe("toCreateFundingRequest", () => {
  it("targetAmount를 숫자로 바꾸고 pledge를 promise로 매핑한다", () => {
    expect(toCreateFundingRequest(7, info, account)).toEqual({
      wishId: 7,
      bank: "KB_KOOKMIN",
      accountNumber: "123-456",
      targetAmount: 50000,
      deadline: "2026-12-31",
      story: "사연",
      promise: "공약",
    });
  });

  it("추천 금액이 있으면 숫자로 바꿔 보내고, 비어 있으면 보내지 않는다", () => {
    expect(
      toCreateFundingRequest(7, { ...info, recommendedAmount: "5000" }, account).recommendedAmount,
    ).toBe(5000);
    expect(
      toCreateFundingRequest(7, { ...info, recommendedAmount: "" }, account).recommendedAmount,
    ).toBeUndefined();
    expect(
      toCreateFundingRequest(7, { ...info, recommendedAmount: "0" }, account).recommendedAmount,
    ).toBeUndefined();
  });

  it("pledge가 비어 있으면 promise를 보내지 않는다", () => {
    expect(toCreateFundingRequest(7, { ...info, pledge: "" }, account).promise).toBeUndefined();
  });
});
