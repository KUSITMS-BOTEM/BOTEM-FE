import { useQuery } from "@tanstack/react-query";

import { contributionService } from "@/apis/contribution/contributionService";

export const myContributionsQueryKey = (shareKey: string) =>
  ["fundings", "share", shareKey, "contributions", "me"] as const;

// 비로그인 화면에서는 401이 나가지 않도록 enabled로 막는다
export const useMyContributionsQuery = (shareKey: string, enabled: boolean) =>
  useQuery({
    queryKey: myContributionsQueryKey(shareKey),
    queryFn: () => contributionService.getMyContributions(shareKey),
    enabled,
    retry: false,
  });
