import { clientApi } from "@/apis/client";
import { payoutAccountService } from "@/apis/payout-account/payoutAccountService";
import type { PayoutAccountResponse } from "@/types/payout-account/payoutAccount";

vi.mock("@/apis/client", () => ({
  clientApi: {
    get: vi.fn(),
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
