import { useMutation, useQueryClient } from "@tanstack/react-query";

import { contributionService } from "@/apis/contribution/contributionService";
import { pendingContributionsQueryKey } from "@/hooks/queries/contribution/usePendingContributionsQuery";
import { fundingManagementQueryKey } from "@/hooks/queries/funding/useFundingManagementQuery";
import { homeFundingsQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";
import type { UndoContributionDecisionsRequest } from "@/types/contribution/contribution";

type UndoContributionDecisionsVariables = UndoContributionDecisionsRequest & { fundingId: number };

// 처리와 같은 쿼리를 무효화한다. 되돌린 참여가 확인 대기 목록과 진행률에 다시 반영돼야 한다
export const useUndoContributionDecisionsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fundingId, ...body }: UndoContributionDecisionsVariables) =>
      contributionService.undoContributionDecisions(fundingId, body),
    onSuccess: (_data, { fundingId }) => {
      queryClient.invalidateQueries({ queryKey: homeFundingsQueryKey });
      queryClient.invalidateQueries({ queryKey: fundingManagementQueryKey(fundingId) });
      return queryClient.invalidateQueries({ queryKey: pendingContributionsQueryKey(fundingId) });
    },
  });
};
