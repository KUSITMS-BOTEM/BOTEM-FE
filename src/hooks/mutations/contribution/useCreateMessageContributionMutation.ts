import { useMutation, useQueryClient } from "@tanstack/react-query";

import { contributionService } from "@/apis/contribution/contributionService";
import {
  type ContributionRequestVariables,
  useContributionRequestBuilder,
} from "@/hooks/mutations/contribution/useContributionRequestBuilder";
import { fundingDetailQueryKey } from "@/hooks/queries/funding/useFundingDetailQuery";
import { myContributionsQueryKey } from "@/hooks/queries/contribution/useMyContributionsQuery";

export const useCreateMessageContributionMutation = (shareKey: string) => {
  const queryClient = useQueryClient();
  const buildRequest = useContributionRequestBuilder(shareKey);

  return useMutation({
    mutationFn: async (variables: ContributionRequestVariables) =>
      contributionService.createMessageContribution(shareKey, await buildRequest(variables)),
    // 이동 전에 반영해야 돌아온 화면이 보탬 전 상태를 캐시에서 읽지 않는다
    // 완료 화면이 방금 보탠 뒤의 참여자 수를 상세에서 읽으므로 상세도 함께 다시 조회한다
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: myContributionsQueryKey(shareKey) }),
        queryClient.invalidateQueries({ queryKey: fundingDetailQueryKey(shareKey), exact: true }),
      ]),
  });
};
