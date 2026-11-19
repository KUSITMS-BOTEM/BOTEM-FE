import { useMutation, useQueryClient } from "@tanstack/react-query";

import { payoutAccountService } from "@/apis/payout-account/payoutAccountService";
import { payoutAccountsQueryKey } from "@/hooks/queries/payout-account/usePayoutAccountsQuery";
import type { PayoutAccountResponse } from "@/types/payout-account/payoutAccount";

export const useUpdatePayoutAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: payoutAccountService.updatePayoutAccount,
    // 응답이 수정된 계좌라 재조회 없이 목록 캐시의 해당 항목만 교체한다. 응답이 비어 있으면 재조회로 맞춘다
    onSuccess: updated => {
      if (!updated) {
        queryClient.invalidateQueries({ queryKey: payoutAccountsQueryKey });
        return;
      }
      queryClient.setQueryData<PayoutAccountResponse[]>(payoutAccountsQueryKey, accounts =>
        accounts?.map(account => (account.id === updated.id ? updated : account)),
      );
    },
  });
};
