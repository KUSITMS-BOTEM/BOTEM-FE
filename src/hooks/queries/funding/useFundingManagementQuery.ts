import { useQuery } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";

export const fundingManagementQueryKey = (fundingId: number) =>
  ["fundings", fundingId, "management"] as const;

export const useFundingManagementQuery = (fundingId: number) =>
  useQuery({
    queryKey: fundingManagementQueryKey(fundingId),
    queryFn: () => fundingService.getFundingManagement(fundingId),
  });
