import { useMutation, useQueryClient } from "@tanstack/react-query";

import { contributionService } from "@/apis/contribution/contributionService";
import { pendingContributionsQueryKey } from "@/hooks/queries/contribution/usePendingContributionsQuery";
import { ownerFundingDetailQueryKey } from "@/hooks/queries/funding/useOwnerFundingDetailQuery";

export const useConfirmAllContributionsMutation = (fundingId: number | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => contributionService.confirmAllContributions(fundingId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home", "fundings"] });
      queryClient.invalidateQueries({ queryKey: ownerFundingDetailQueryKey(fundingId) });
      // 확인 대기 목록 재조회까지 끝나야 isPending이 풀리도록 promise를 반환한다 (재조회 전 처리한 항목이 목록에 남아 다시 눌리는 것 방지)
      return queryClient.invalidateQueries({ queryKey: pendingContributionsQueryKey(fundingId) });
    },
  });
};
