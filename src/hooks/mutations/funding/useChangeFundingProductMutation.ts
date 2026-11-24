import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";
import { fundingManagementQueryKey } from "@/hooks/queries/funding/useFundingManagementQuery";
import { fundingResultQueryKey } from "@/hooks/queries/funding/useFundingResultQuery";
import { surpriseRevealQueryKey } from "@/hooks/queries/funding/useSurpriseRevealQuery";
import { wishesQueryKey } from "@/hooks/queries/wish/useWishesQuery";

export const useChangeFundingProductMutation = (fundingId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (wishId: number) => fundingService.changeFundingProduct(fundingId, { wishId }),
    // 응답엔 바뀐 상품만 있고 productChanged·결과 상품명 등은 다른 응답에 흩어져 있어 setQueryData 대신 무효화한다
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundingResultQueryKey(fundingId) });
      queryClient.invalidateQueries({ queryKey: fundingManagementQueryKey(fundingId) });
      // 서프라이즈는 받는 사람이 바꾸며, 공개 상세의 상품·productChanged가 바뀐다
      queryClient.invalidateQueries({ queryKey: surpriseRevealQueryKey(fundingId) });
      // 펀딩에 쓰는 위시가 바뀌면 위시의 status·fundingId도 바뀐다 — ["wishes"] 접두사로 목록·홈 위시·상세를 함께 무효화한다
      queryClient.invalidateQueries({ queryKey: wishesQueryKey });
      queryClient.invalidateQueries({ queryKey: homeQueryKey });
    },
  });
};
