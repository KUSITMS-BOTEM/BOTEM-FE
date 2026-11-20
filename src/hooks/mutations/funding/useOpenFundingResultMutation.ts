import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";
import { fundingResultQueryKey } from "@/hooks/queries/funding/useFundingResultQuery";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";

export const useOpenFundingResultMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fundingId: number) => fundingService.openResult(fundingId),
    // 응답이 결과 조회와 같은 형태라 캐시에 바로 쓰고, 홈 카드는 열람 상태가 바뀌므로 다시 조회한다
    // 공개 전에 시작된 결과 조회가 늦게 끝나며 열람 전 값으로 덮어쓰지 않도록 먼저 취소한다
    onSuccess: async (data, fundingId) => {
      await queryClient.cancelQueries({ queryKey: fundingResultQueryKey(fundingId) });
      queryClient.setQueryData(fundingResultQueryKey(fundingId), data);
      queryClient.invalidateQueries({ queryKey: homeQueryKey });
    },
  });
};
