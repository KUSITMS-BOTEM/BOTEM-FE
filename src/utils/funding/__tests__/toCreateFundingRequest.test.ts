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

  it("pledge가 비어 있으면 promise를 보내지 않는다", () => {
    expect(toCreateFundingRequest(7, { ...info, pledge: "" }, account).promise).toBeUndefined();
  });
});
