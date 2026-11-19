import { useQuery } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";

export const closedFundingsQueryKey = ["users", "me", "fundings", "closed"] as const;

export const useClosedFundingsQuery = (enabled = true) =>
  useQuery({
    queryKey: closedFundingsQueryKey,
    queryFn: fundingService.getClosedFundings,
    enabled,
  });
