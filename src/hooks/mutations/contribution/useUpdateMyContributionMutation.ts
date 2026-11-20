import { useMutation, useQueryClient } from "@tanstack/react-query";

import { contributionService } from "@/apis/contribution/contributionService";
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
    // 수정된 값이 응답으로 오므로 목록 캐시의 해당 보탬만 바로 교체한다
    onSuccess: updated => {
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
