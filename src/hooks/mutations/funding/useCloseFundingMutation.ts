import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";
import { closedFundingsQueryKey } from "@/hooks/queries/funding/useClosedFundingsQuery";
import { fundingManagementQueryKey } from "@/hooks/queries/funding/useFundingManagementQuery";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";
import { wishesQueryKey } from "@/hooks/queries/wish/useWishesQuery";

export const useCloseFundingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fundingService.closeFunding,
    // 응답엔 마감 시각 요약뿐이라 상세(관리)·홈 펀딩 카드·보관함의 진행·마감 상태는 다시 조회해 맞춘다
    onSuccess: (data, fundingId) => {
      // 종료(CANCELLED)된 펀딩은 관리 조회가 404라, 마운트된 화면이 재조회하면 전역 에러가 뜬다
      if (data?.status !== "CANCELLED") {
        queryClient.invalidateQueries({ queryKey: fundingManagementQueryKey(fundingId) });
      }
      queryClient.invalidateQueries({ queryKey: homeQueryKey });
      queryClient.invalidateQueries({ queryKey: closedFundingsQueryKey });
      // 참여자 0명 종료는 같은 위시로 다시 펀딩을 열 수 있게 되므로 위시의 펀딩 상태도 다시 읽는다
      queryClient.invalidateQueries({ queryKey: wishesQueryKey });
    },
  });
};
