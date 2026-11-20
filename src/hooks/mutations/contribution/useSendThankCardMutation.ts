import { useMutation, useQueryClient } from "@tanstack/react-query";

import { contributionService } from "@/apis/contribution/contributionService";
import { fundingManagementQueryKey } from "@/hooks/queries/funding/useFundingManagementQuery";
import type { SendContributionThankCardRequest } from "@/types/contribution/contribution";

type SendThankCardVariables = SendContributionThankCardRequest & {
  fundingId: number;
  contributionId: number;
};

export const useSendThankCardMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fundingId, contributionId, ...body }: SendThankCardVariables) =>
      contributionService.sendThankCard(fundingId, contributionId, body),
    // 관리 상세의 참여자별 thankCardSent가 바뀌어 '감사카드 보내기' 배지가 사라져야 한다
    onSuccess: (_data, { fundingId }) =>
      queryClient.invalidateQueries({ queryKey: fundingManagementQueryKey(fundingId) }),
  });
};
