import { useMutation, useQueryClient } from "@tanstack/react-query";

import { contributionService } from "@/apis/contribution/contributionService";
import { fundingDetailQueryKey } from "@/hooks/queries/funding/useFundingDetailQuery";
import { myContributionsQueryKey } from "@/hooks/queries/contribution/useMyContributionsQuery";
import type {
  MyContributionListResponse,
  UpdateMyContributionRequest,
} from "@/types/contribution/contribution";

type Variables = { contributionId: number; body: UpdateMyContributionRequest };

export const useUpdateMyContributionMutation = (shareKey: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contributionId, body }: Variables) =>
      contributionService.updateMyContribution(shareKey, contributionId, body),
    // 수정된 값이 응답으로 오므로 목록 캐시의 해당 보탬만 바로 교체하고, 상세는 다시 조회한다
    onSuccess: updated => {
      void queryClient.invalidateQueries({
        queryKey: fundingDetailQueryKey(shareKey),
        exact: true,
      });
      if (!updated) return;
      queryClient.setQueryData<MyContributionListResponse>(
        myContributionsQueryKey(shareKey),
        old =>
          old && {
            ...old,
            contributions: old.contributions.map(item =>
              item.contributionId === updated.contributionId ? updated : item,
            ),
          },
      );
    },
  });
};
