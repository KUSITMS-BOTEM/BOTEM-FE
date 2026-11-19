import { clientApi } from "@/apis/client";
import type {
  BankResponse,
  PayoutAccountResponse,
  SavePayoutAccountRequest,
} from "@/types/payout-account/payoutAccount";

export const payoutAccountService = {
  getPayoutAccounts: () => clientApi.get<PayoutAccountResponse[]>("/api/users/me/payout-accounts"),
  getBanks: () => clientApi.get<BankResponse[]>("/api/users/me/payout-accounts/banks"),
  createPayoutAccount: (body: SavePayoutAccountRequest) =>
    clientApi.post<PayoutAccountResponse>("/api/users/me/payout-accounts", body),
  setDefaultPayoutAccount: (accountId: number) =>
    clientApi.patch<PayoutAccountResponse>(`/api/users/me/payout-accounts/${accountId}/default`),
  updatePayoutAccount: ({ accountId, ...body }: SavePayoutAccountRequest & { accountId: number }) =>
    clientApi.put<PayoutAccountResponse>(`/api/users/me/payout-accounts/${accountId}`, body),
};
