import { useQuery } from "@tanstack/react-query";

import { contributionService } from "@/apis/contribution/contributionService";
import { pendingContributionsQueryKey } from "@/hooks/queries/contribution/usePendingContributionsQuery";

// 구 스펙 응답을 캐시하는 홈 바텀시트 키(pendingContributionsQueryKey)의 하위 키라, 같은 키로 무효화하면 함께 갱신된다
export const pendingContributionItemsQueryKey = (fundingId: number) =>
  [...pendingContributionsQueryKey(fundingId), "items"] as const;

export const usePendingContributionItemsQuery = (fundingId: number, enabled: boolean) =>
  useQuery({
    queryKey: pendingContributionItemsQueryKey(fundingId),
    queryFn: () => contributionService.getPendingContributionItems(fundingId),
    enabled,
    retry: false,
  });
