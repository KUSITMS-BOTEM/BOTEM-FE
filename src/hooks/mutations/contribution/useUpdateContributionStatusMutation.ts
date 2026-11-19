import { useMutation, useQueryClient } from "@tanstack/react-query";

import { contributionService } from "@/apis/contribution/contributionService";
import { homeFundingsQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";
import { pendingContributionsQueryKey } from "@/hooks/queries/contribution/usePendingContributionsQuery";
import type { UpdateContributionStatusRequest } from "@/types/contribution/contribution";

export const useUpdateContributionStatusMutation = (fundingId: number | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateContributionStatusRequest) =>
      contributionService.updateContributionStatus(fundingId!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homeFundingsQueryKey });
      // 확인 대기 목록 재조회까지 끝나야 isPending이 풀리도록 promise를 반환한다 (재조회 전 빈 목록으로 공개 단계에 넘어가는 것 방지)
      return queryClient.invalidateQueries({ queryKey: pendingContributionsQueryKey(fundingId) });
    },
  });
};
