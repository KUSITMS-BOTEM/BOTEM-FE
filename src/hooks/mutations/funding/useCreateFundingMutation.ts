import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";
import { homeWishesQueryKey } from "@/hooks/queries/wish/useHomeWishesQuery";
import { wishesQueryKey } from "@/hooks/queries/wish/useWishesQuery";

export const useCreateFundingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fundingService.postFunding,
    // 응답엔 개설된 펀딩 요약뿐이라 setQueryData 대신 무효화한다. 이동할 홈이 개설 전 목록을 읽지 않게 이동보다 먼저 호출한다
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishesQueryKey, exact: true });
      queryClient.invalidateQueries({ queryKey: homeWishesQueryKey });
      queryClient.invalidateQueries({ queryKey: homeQueryKey });
    },
  });
};
