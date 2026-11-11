import { useMutation, useQueryClient } from "@tanstack/react-query";

import { contributionService } from "@/apis/contribution/contributionService";
import { pendingContributionsQueryKey } from "@/hooks/queries/contribution/usePendingContributionsQuery";
import type { UpdateContributionStatusRequest } from "@/types/contribution/contribution";

export const useUpdateContributionStatusMutation = (fundingId: number | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateContributionStatusRequest) =>
      contributionService.updateContributionStatus(fundingId!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pendingContributionsQueryKey(fundingId) });
      queryClient.invalidateQueries({ queryKey: ["home", "fundings"] });
    },
  });
};
