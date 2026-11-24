import { useMutation, useQueryClient } from "@tanstack/react-query";

import { contributionService } from "@/apis/contribution/contributionService";
import { fundingManagementQueryKey } from "@/hooks/queries/funding/useFundingManagementQuery";
import { surpriseThankCardFriendsQueryKey } from "@/hooks/queries/funding/useSurpriseThankCardFriendsQuery";
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
    // 참여자별 thankCardSent가 바뀌어 '감사카드 보내기' 배지가 사라져야 한다 (생일: 관리 상세, 서프라이즈: 고마운 친구 목록)
    onSuccess: (_data, { fundingId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: fundingManagementQueryKey(fundingId) }),
        queryClient.invalidateQueries({ queryKey: surpriseThankCardFriendsQueryKey(fundingId) }),
      ]),
  });
};
