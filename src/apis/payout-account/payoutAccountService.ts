import { clientApi } from "@/apis/client";
import type { PayoutAccountResponse } from "@/types/payout-account/payoutAccount";

export const payoutAccountService = {
  getPayoutAccounts: () => clientApi.get<PayoutAccountResponse[]>("/api/users/me/payout-accounts"),
};
