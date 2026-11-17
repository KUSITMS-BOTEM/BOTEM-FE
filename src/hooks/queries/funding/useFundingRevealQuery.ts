import { queryOptions, useQuery } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";

export const fundingRevealQueryKey = (fundingId: number) =>
  ["fundings", fundingId, "reveal"] as const;

export const fundingRevealQueryOptions = (fundingId: number) =>
  queryOptions({
    queryKey: fundingRevealQueryKey(fundingId),
    queryFn: () => fundingService.getReveal(fundingId),
    // 홈에서 이동 직전에 받아 둔 결과를 공개 화면 진입 때 다시 요청하지 않도록 한다 (마감된 결과라 짧은 시간 안에는 바뀌지 않음)
    staleTime: 60_000,
  });

export const useFundingRevealQuery = (fundingId: number) =>
  useQuery(fundingRevealQueryOptions(fundingId));
