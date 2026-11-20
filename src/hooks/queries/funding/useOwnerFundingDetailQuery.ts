import { useQuery } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";

export const ownerFundingDetailQueryKey = (fundingId: number | null) =>
  ["fundings", fundingId, "management"] as const;

export const useOwnerFundingDetailQuery = ({
  fundingId,
  enabled,
}: {
  fundingId: number;
  enabled: boolean;
}) =>
  useQuery({
    queryKey: ownerFundingDetailQueryKey(fundingId),
    queryFn: () => fundingService.getOwnerFundingDetail(fundingId),
    enabled,
  });
