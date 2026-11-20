import { useMutation, useQueryClient } from "@tanstack/react-query";

import { contributionService } from "@/apis/contribution/contributionService";
import { fundingDetailQueryKey } from "@/hooks/queries/funding/useFundingDetailQuery";
import { myContributionsQueryKey } from "@/hooks/queries/contribution/useMyContributionsQuery";

type MarkTransferSentVariables = {
  contributionId: number;
  // 비회원일 때만 있다
  guestPassword?: string;
};

export const useMarkTransferSentMutation = (shareKey: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contributionId, guestPassword }: MarkTransferSentVariables) =>
      contributionService.markTransferSent(shareKey, contributionId, {
        guestPassword: guestPassword ?? null,
      }),
    // 송금 확인 대기분이 달성률에 잡히므로 펀딩 상세도 함께 다시 조회한다
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: myContributionsQueryKey(shareKey) }),
        queryClient.invalidateQueries({ queryKey: fundingDetailQueryKey(shareKey), exact: true }),
      ]),
  });
};
