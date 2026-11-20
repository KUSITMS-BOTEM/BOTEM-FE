import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";
import { fundingResultQueryKey } from "@/hooks/queries/funding/useFundingResultQuery";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";

export const useOpenFundingResultMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fundingId: number) => fundingService.openResult(fundingId),
    // 응답이 결과 조회와 같은 형태라 캐시에 바로 쓰고, 홈 카드는 열람 상태가 바뀌므로 다시 조회한다
    onSuccess: (data, fundingId) => {
      queryClient.setQueryData(fundingResultQueryKey(fundingId), data);
      queryClient.invalidateQueries({ queryKey: homeQueryKey });
    },
  });
};
