import { useQuery } from "@tanstack/react-query";

import { payoutAccountService } from "@/apis/payout-account/payoutAccountService";

export const usePayoutAccountsQuery = () =>
  useQuery({
    queryKey: ["users", "me", "payout-accounts"],
    queryFn: payoutAccountService.getPayoutAccounts,
    // 대표 계좌 채우기는 부가 기능이라 실패해도 전역 에러 토스트를 띄우지 않고 버튼만 비활성으로 둔다
    meta: { skipGlobalError: true },
  });
