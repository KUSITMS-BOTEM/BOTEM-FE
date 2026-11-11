import { useQuery } from "@tanstack/react-query";

import { contributionService } from "@/apis/contribution/contributionService";

export const pendingContributionsQueryKey = (fundingId: number | null) =>
  ["fundings", fundingId, "contributions", "pending"] as const;

export const usePendingContributionsQuery = ({
  fundingId,
  enabled,
}: {
  fundingId: number | null;
  enabled: boolean;
}) =>
  useQuery({
    queryKey: pendingContributionsQueryKey(fundingId),
    queryFn: () => contributionService.getPendingContributions(fundingId!),
    enabled: enabled && fundingId !== null,
  });
