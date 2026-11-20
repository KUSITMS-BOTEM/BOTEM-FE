import { useMutation, useQueryClient } from "@tanstack/react-query";

import { contributionService } from "@/apis/contribution/contributionService";
import {
  type ContributionRequestVariables,
  useContributionRequestBuilder,
} from "@/hooks/mutations/contribution/useContributionRequestBuilder";
import { myContributionsQueryKey } from "@/hooks/queries/contribution/useMyContributionsQuery";

export const useCreateMessageContributionMutation = (shareKey: string) => {
  const queryClient = useQueryClient();
  const buildRequest = useContributionRequestBuilder(shareKey);

  return useMutation({
    mutationFn: async (variables: ContributionRequestVariables) =>
      contributionService.createMessageContribution(shareKey, await buildRequest(variables)),
    // 이동 전에 반영해야 돌아온 화면이 보탬 전 상태를 캐시에서 읽지 않는다
    onSuccess: () => queryClient.invalidateQueries({ queryKey: myContributionsQueryKey(shareKey) }),
  });
};
