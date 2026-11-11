import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { payoutAccountService } from "@/apis/payout-account/payoutAccountService";
import { usePayoutAccountsQuery } from "@/hooks/queries/payout-account/usePayoutAccountsQuery";
import type { PayoutAccountResponse } from "@/types/payout-account/payoutAccount";

vi.mock("@/apis/payout-account/payoutAccountService", () => ({
  payoutAccountService: {
    getPayoutAccounts: vi.fn(),
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

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("usePayoutAccountsQuery", () => {
  it("payoutAccountService.getPayoutAccounts를 호출하고 반환 데이터를 돌려준다", async () => {
    vi.mocked(payoutAccountService.getPayoutAccounts).mockResolvedValue(mockAccounts);

    const { result } = renderHook(() => usePayoutAccountsQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(payoutAccountService.getPayoutAccounts).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockAccounts);
  });

  it("서비스가 실패하면 isError가 된다", async () => {
    vi.mocked(payoutAccountService.getPayoutAccounts).mockRejectedValue(new Error("조회 실패"));

    const { result } = renderHook(() => usePayoutAccountsQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("빈 배열을 반환해도 정상 처리한다", async () => {
    vi.mocked(payoutAccountService.getPayoutAccounts).mockResolvedValue([]);

    const { result } = renderHook(() => usePayoutAccountsQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
