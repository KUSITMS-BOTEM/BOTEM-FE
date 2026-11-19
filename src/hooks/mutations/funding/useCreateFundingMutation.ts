import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";
import { homeWishesQueryKey } from "@/hooks/queries/wish/useHomeWishesQuery";
import { wishQueryKey } from "@/hooks/queries/wish/useWishQuery";
import { wishesQueryKey } from "@/hooks/queries/wish/useWishesQuery";

export const useCreateFundingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fundingService.postFunding,
    // 응답엔 개설된 펀딩 요약뿐이라 setQueryData 대신 무효화한다. 이동할 홈이 개설 전 목록을 읽지 않게 이동보다 먼저 호출한다
    onSuccess: (_data, { wishId }) => {
      // 개설하면 위시의 status·fundingId가 바뀌므로 캐시된 상세가 "펀딩 열기" CTA를 다시 보여주지 않게 한다
      queryClient.invalidateQueries({ queryKey: wishQueryKey(String(wishId)) });
      queryClient.invalidateQueries({ queryKey: wishesQueryKey, exact: true });
      queryClient.invalidateQueries({ queryKey: homeWishesQueryKey });
      queryClient.invalidateQueries({ queryKey: homeQueryKey });
    },
  });
};
