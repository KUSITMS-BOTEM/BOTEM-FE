import { useQuery } from "@tanstack/react-query";

import { contributionService } from "@/apis/contribution/contributionService";

export const myContributionsQueryKey = (fundingId: number) =>
  ["fundings", fundingId, "contributions", "me"] as const;

// 비로그인 화면에서는 401이 나가지 않도록 enabled로 막는다
export const useMyContributionsQuery = (fundingId: number, enabled: boolean) =>
  useQuery({
    queryKey: myContributionsQueryKey(fundingId),
    queryFn: () => contributionService.getMyContributions(fundingId),
    enabled,
    retry: false,
  });
