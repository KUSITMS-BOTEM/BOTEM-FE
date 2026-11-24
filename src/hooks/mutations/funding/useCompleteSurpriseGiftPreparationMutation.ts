import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";
import { surpriseGiftPreparationQueryKey } from "@/hooks/queries/funding/useSurpriseGiftPreparationQuery";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";

export const useCompleteSurpriseGiftPreparationMutation = (fundingId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => fundingService.completeSurpriseGiftPreparation(fundingId),
    // 응답이 조회와 같은 형태라 캐시에 바로 쓰고, 홈 카드는 선물 준비 단계가 바뀌므로 다시 조회한다
    onSuccess: data => {
      if (data) queryClient.setQueryData(surpriseGiftPreparationQueryKey(fundingId), data);
      queryClient.invalidateQueries({ queryKey: homeQueryKey });
    },
  });
};
