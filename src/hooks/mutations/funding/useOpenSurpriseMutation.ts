import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";
import { surpriseRevealQueryKey } from "@/hooks/queries/funding/useSurpriseRevealQuery";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";

export const useOpenSurpriseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fundingId: number) => fundingService.openSurprise(fundingId),
    // 응답이 공개 상세와 같은 형태라 캐시에 바로 쓰고, 홈 공개 카드는 열람 상태가 바뀌므로 다시 조회한다
    // 공개 전에 시작된 조회가 늦게 끝나며 열기 전 값으로 덮어쓰지 않도록 먼저 취소한다
    onSuccess: async (data, fundingId) => {
      await queryClient.cancelQueries({ queryKey: surpriseRevealQueryKey(fundingId), exact: true });
      if (data) queryClient.setQueryData(surpriseRevealQueryKey(fundingId), data);
      queryClient.invalidateQueries({ queryKey: homeQueryKey });
    },
  });
};
