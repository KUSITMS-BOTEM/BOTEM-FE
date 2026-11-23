import { useQuery } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";

export const closedFundingsQueryKey = ["users", "me", "fundings", "closed"] as const;

export const useClosedFundingsQuery = (enabled = true) =>
  useQuery({
    queryKey: closedFundingsQueryKey,
    queryFn: fundingService.getClosedFundings,
    enabled,
    // 내 메뉴는 실패 시 직접 다이얼로그를 띄우고, 마감 목록 시트는 에러 화면(다시 시도)을 직접 보여준다
    meta: { skipGlobalError: true },
  });
