import { useQuery } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";

export const fundingRevealQueryKey = (fundingId: number) =>
  ["fundings", fundingId, "reveal"] as const;

export const useFundingRevealQuery = (fundingId: number) =>
  useQuery({
    queryKey: fundingRevealQueryKey(fundingId),
    queryFn: () => fundingService.getReveal(fundingId),
  });
