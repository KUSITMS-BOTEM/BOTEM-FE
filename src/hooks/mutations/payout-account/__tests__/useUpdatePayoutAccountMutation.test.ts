import { createElement, type ReactNode } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { payoutAccountService } from "@/apis/payout-account/payoutAccountService";
import { useUpdatePayoutAccountMutation } from "@/hooks/mutations/payout-account/useUpdatePayoutAccountMutation";
import { payoutAccountsQueryKey } from "@/hooks/queries/payout-account/usePayoutAccountsQuery";
import { queryClient } from "@/lib/queryClient";
import type { PayoutAccountResponse } from "@/types/payout-account/payoutAccount";

vi.mock("@/apis/payout-account/payoutAccountService", () => ({
  payoutAccountService: {
    updatePayoutAccount: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(QueryClientProvider, { client: queryClient }, children);

const account = (id: number, accountNumber: string): PayoutAccountResponse => ({
  id,
  bank: "TOSS_BANK",
  bankName: "토스뱅크",
  accountNumber,
  accountHolder: null,
  isDefault: id === 1,
  verificationStatus: "UNVERIFIED",
});

const variables = {
  accountId: 1,
  bank: "TOSS_BANK" as const,
  accountNumber: "123456789012",
  accountHolder: null,
};

describe("useUpdatePayoutAccountMutation", () => {
  beforeEach(() => {
    queryClient.clear();
    vi.mocked(payoutAccountService.updatePayoutAccount).mockReset();
  });

  it("mutate 호출 시 updatePayoutAccount가 전달받은 변수로 호출된다", async () => {
    vi.mocked(payoutAccountService.updatePayoutAccount).mockResolvedValue(
      account(1, "123456789012"),
    );
    const { result } = renderHook(() => useUpdatePayoutAccountMutation(), { wrapper });

    result.current.mutate(variables);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(vi.mocked(payoutAccountService.updatePayoutAccount).mock.calls[0][0]).toEqual(variables);
  });

  it("성공하면 목록 캐시에서 id가 같은 계좌만 응답 값으로 교체하고 나머지는 유지한다", async () => {
    const other = account(2, "999999999999");
    queryClient.setQueryData(payoutAccountsQueryKey, [account(1, "100159014821"), other]);
    vi.mocked(payoutAccountService.updatePayoutAccount).mockResolvedValue(
      account(1, "123456789012"),
    );
    const { result } = renderHook(() => useUpdatePayoutAccountMutation(), { wrapper });

    result.current.mutate(variables);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(payoutAccountsQueryKey)).toEqual([
      account(1, "123456789012"),
      other,
    ]);
  });

  it("목록 캐시가 없으면 캐시를 새로 만들지 않는다", async () => {
    vi.mocked(payoutAccountService.updatePayoutAccount).mockResolvedValue(
      account(1, "123456789012"),
    );
    const { result } = renderHook(() => useUpdatePayoutAccountMutation(), { wrapper });

    result.current.mutate(variables);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(payoutAccountsQueryKey)).toBeUndefined();
  });

  it("응답이 null이면 캐시를 건드리지 않는다", async () => {
    const cached = [account(1, "100159014821")];
    queryClient.setQueryData(payoutAccountsQueryKey, cached);
    vi.mocked(payoutAccountService.updatePayoutAccount).mockResolvedValue(null);
    const { result } = renderHook(() => useUpdatePayoutAccountMutation(), { wrapper });

    result.current.mutate(variables);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(payoutAccountsQueryKey)).toEqual(cached);
  });

  it("실패하면 캐시는 그대로이고 isError가 true가 된다", async () => {
    const cached = [account(1, "100159014821")];
    queryClient.setQueryData(payoutAccountsQueryKey, cached);
    vi.mocked(payoutAccountService.updatePayoutAccount).mockRejectedValue(new Error("실패"));
    const { result } = renderHook(() => useUpdatePayoutAccountMutation(), { wrapper });

    result.current.mutate(variables);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(payoutAccountsQueryKey)).toEqual(cached);
  });
});
