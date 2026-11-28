import { queryOptions, useQuery } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";

export const fundingResultQueryKey = (fundingId: number) =>
  ["fundings", fundingId, "result"] as const;

export const fundingResultQueryOptions = (fundingId: number) =>
  queryOptions({
    queryKey: fundingResultQueryKey(fundingId),
    queryFn: () => fundingService.getResult(fundingId),
    // 홈에서 이동 직전에 받아 둔 결과를 공개 화면 진입 때 다시 요청하지 않도록 한다 (마감된 결과라 짧은 시간 안에는 바뀌지 않음)
    staleTime: 60_000,
  });

// quietCodes: 화면이 직접 처리하는 에러 코드. 이 코드만 전역 안내를 건너뛰고, 재시도는 끈다
export const useFundingResultQuery = (fundingId: number, enabled = true, quietCodes?: string[]) =>
  useQuery({
    ...fundingResultQueryOptions(fundingId),
    enabled,
    ...(quietCodes && { meta: { quietCodes }, retry: false }),
  });
