import { useMutation, useQueryClient } from "@tanstack/react-query";

import { contributionService } from "@/apis/contribution/contributionService";
import {
  type ContributionRequestVariables,
  useContributionRequestBuilder,
} from "@/hooks/mutations/contribution/useContributionRequestBuilder";
import { myContributionsQueryKey } from "@/hooks/queries/contribution/useMyContributionsQuery";

type CreateContributionVariables = ContributionRequestVariables & { amount: number };

// 송금 대기(AWAITING_TRANSFER)로 저장하고 송금 계좌를 돌려준다. 송금 확인은 useMarkTransferSentMutation이 맡는다
export const useCreateContributionMutation = (fundingId: number) => {
  const queryClient = useQueryClient();
  const buildRequest = useContributionRequestBuilder(fundingId);

  return useMutation({
    mutationFn: async ({ amount, ...variables }: CreateContributionVariables) =>
      contributionService.createContribution(fundingId, {
        ...(await buildRequest(variables)),
        amount,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: myContributionsQueryKey(fundingId) }),
  });
};
