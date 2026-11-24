import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";
import { fundingManagementQueryKey } from "@/hooks/queries/funding/useFundingManagementQuery";
import { surpriseRevealQueryKey } from "@/hooks/queries/funding/useSurpriseRevealQuery";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";

export const useChooseGiftMutation = (fundingId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => fundingService.chooseGift(fundingId),
    // 선물을 정하면 연장·상품 변경이 막히고 홈 카드가 '인증할 선물' 배너로 옮겨 간다. 응답엔 그 상태가 없어 다시 조회한다
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundingManagementQueryKey(fundingId) });
      // 서프라이즈는 받는 사람이 고르며, 공개 상세의 giftChosen이 바뀐다
      queryClient.invalidateQueries({ queryKey: surpriseRevealQueryKey(fundingId) });
      queryClient.invalidateQueries({ queryKey: homeQueryKey });
    },
  });
};
