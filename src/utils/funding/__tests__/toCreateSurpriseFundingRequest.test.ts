import { toCreateSurpriseFundingRequest } from "@/utils/funding/toCreateSurpriseFundingRequest";

const info = { targetAmount: "350000", deadline: "2026-11-30", revealDate: "2026-12-01" };
const account = { bank: "TOSS_BANK", accountNumber: "100159014821" } as const;

describe("toCreateSurpriseFundingRequest", () => {
  it("입력값을 서프라이즈 개설 요청 형태로 바꾼다", () => {
    expect(toCreateSurpriseFundingRequest("3", 9, info, account, true)).toEqual({
      recipientId: 3,
      wishId: 9,
      bank: "TOSS_BANK",
      accountNumber: "100159014821",
      targetAmount: 350000,
      deadline: "2026-11-30",
      revealAt: "2026-12-01T00:00:00",
      notifyRecipientFriends: true,
    });
  });

  it("알리지 않기로 하면 notifyRecipientFriends가 false다", () => {
    expect(
      toCreateSurpriseFundingRequest("3", 9, info, account, false).notifyRecipientFriends,
    ).toBe(false);
  });
});
