import { clientApi } from "@/apis/client";
import type {
  PayoutAccountResponse,
  SavePayoutAccountRequest,
} from "@/types/payout-account/payoutAccount";

export const payoutAccountService = {
  getPayoutAccounts: () => clientApi.get<PayoutAccountResponse[]>("/api/users/me/payout-accounts"),
  updatePayoutAccount: ({ accountId, ...body }: SavePayoutAccountRequest & { accountId: number }) =>
    clientApi.put<PayoutAccountResponse>(`/api/users/me/payout-accounts/${accountId}`, body),
};
