import { useMutation, useQueryClient } from "@tanstack/react-query";

import { contributionService } from "@/apis/contribution/contributionService";
import { pendingContributionsQueryKey } from "@/hooks/queries/contribution/usePendingContributionsQuery";
import { ownerFundingDetailQueryKey } from "@/hooks/queries/funding/useOwnerFundingDetailQuery";
import { homeFundingsQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";

type RejectContributionVariables = { fundingId: number; contributionId: number };

// fundingId를 훅 인자가 아니라 변수로 받는다. 요청 중 시트가 다른 펀딩으로 바뀌어도 처리한 펀딩의 쿼리를 무효화해야 한다
export const useRejectContributionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fundingId, contributionId }: RejectContributionVariables) =>
      contributionService.rejectContribution(fundingId, contributionId),
    onSuccess: (_data, { fundingId }) => {
      queryClient.invalidateQueries({ queryKey: homeFundingsQueryKey });
      queryClient.invalidateQueries({ queryKey: ownerFundingDetailQueryKey(fundingId) });
      // 확인 대기 목록 재조회까지 끝나야 isPending이 풀리도록 promise를 반환한다 (재조회 전 처리한 항목이 목록에 남아 다시 눌리는 것 방지)
      return queryClient.invalidateQueries({ queryKey: pendingContributionsQueryKey(fundingId) });
    },
  });
};
