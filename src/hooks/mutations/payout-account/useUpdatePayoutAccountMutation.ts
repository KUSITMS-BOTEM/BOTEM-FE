import { useMutation } from "@tanstack/react-query";

import { payoutAccountService } from "@/apis/payout-account/payoutAccountService";
import { payoutAccountsQueryKey } from "@/hooks/queries/payout-account/usePayoutAccountsQuery";
import { queryClient } from "@/lib/queryClient";
import type { PayoutAccountResponse } from "@/types/payout-account/payoutAccount";

export const useUpdatePayoutAccountMutation = () =>
  useMutation({
    mutationFn: payoutAccountService.updatePayoutAccount,
    // 응답이 수정된 계좌라 재조회 없이 목록 캐시의 해당 항목만 교체한다
    onSuccess: updated => {
      if (!updated) return;
      queryClient.setQueryData<PayoutAccountResponse[]>(payoutAccountsQueryKey, accounts =>
        accounts?.map(account => (account.id === updated.id ? updated : account)),
      );
    },
  });
