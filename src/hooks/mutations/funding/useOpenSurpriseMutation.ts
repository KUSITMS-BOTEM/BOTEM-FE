import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";
import { surpriseRevealQueryKey } from "@/hooks/queries/funding/useSurpriseRevealQuery";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";

export const useOpenSurpriseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fundingId: number) => fundingService.openSurprise(fundingId),
    // 응답이 공개 상세와 같은 형태라 캐시에 바로 쓰고, 홈 공개 카드는 열람 상태가 바뀌므로 다시 조회한다
    onSuccess: (data, fundingId) => {
      if (data) queryClient.setQueryData(surpriseRevealQueryKey(fundingId), data);
      queryClient.invalidateQueries({ queryKey: homeQueryKey });
    },
  });
};
