import { useQuery } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";

export const fundingManagementQueryKey = (fundingId: number) =>
  ["fundings", fundingId, "management"] as const;

export const useFundingManagementQuery = (fundingId: number, enabled: boolean) =>
  useQuery({
    queryKey: fundingManagementQueryKey(fundingId),
    queryFn: () => fundingService.getFundingManagement(fundingId),
    enabled,
    // 개설자가 아니면(403) 재시도해도 같다
    retry: false,
  });
