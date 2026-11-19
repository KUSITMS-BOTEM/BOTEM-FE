import { clientApi } from "@/apis/client";
import { payoutAccountService } from "@/apis/payout-account/payoutAccountService";
import type { PayoutAccountResponse } from "@/types/payout-account/payoutAccount";

vi.mock("@/apis/client", () => ({
  clientApi: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

const mockAccounts: PayoutAccountResponse[] = [
  {
    id: 1,
    bank: "TOSS_BANK",
    bankName: "토스뱅크",
    accountNumber: "100159014821",
    accountHolder: null,
    isDefault: true,
    verificationStatus: "UNVERIFIED",
  },
];

describe("payoutAccountService.getPayoutAccounts", () => {
  it("clientApi.get을 /api/users/me/payout-accounts 경로로 호출한다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue(mockAccounts);

    await payoutAccountService.getPayoutAccounts();

    expect(clientApi.get).toHaveBeenCalledWith("/api/users/me/payout-accounts");
  });

  it("clientApi.get이 반환한 배열을 그대로 반환한다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue(mockAccounts);

    await expect(payoutAccountService.getPayoutAccounts()).resolves.toEqual(mockAccounts);
  });

  it("clientApi.get이 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("받을 계좌 조회 실패");
    vi.mocked(clientApi.get).mockRejectedValue(error);

    await expect(payoutAccountService.getPayoutAccounts()).rejects.toBe(error);
  });
});

describe("payoutAccountService.updatePayoutAccount", () => {
  it("accountId는 경로로, 나머지는 body로 clientApi.put을 호출하고 응답을 반환한다", async () => {
    vi.mocked(clientApi.put).mockResolvedValue(mockAccounts[0]);

    const result = await payoutAccountService.updatePayoutAccount({
      accountId: 1,
      bank: "TOSS_BANK",
      accountNumber: "123456789012",
      accountHolder: null,
    });

    expect(clientApi.put).toHaveBeenCalledWith("/api/users/me/payout-accounts/1", {
      bank: "TOSS_BANK",
      accountNumber: "123456789012",
      accountHolder: null,
    });
    expect(result).toEqual(mockAccounts[0]);
  });
});
