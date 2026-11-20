import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";
import { fundingManagementQueryKey } from "@/hooks/queries/funding/useFundingManagementQuery";

export const useExtendFundingMutation = (fundingId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newDeadline: string) => fundingService.extendFunding(fundingId, { newDeadline }),
    // 결과 조회는 연장 뒤 새 마감일 전까지 409(FUNDING_005)라 무효화하지 않고, 지금 보이는 결과를 그대로 둔다
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundingManagementQueryKey(fundingId) });
      queryClient.invalidateQueries({ queryKey: homeQueryKey });
    },
  });
};
