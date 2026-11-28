import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";
import { closedFundingsQueryKey } from "@/hooks/queries/funding/useClosedFundingsQuery";
import { fundingManagementQueryKey } from "@/hooks/queries/funding/useFundingManagementQuery";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";

export const useCloseFundingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fundingService.closeFunding,
    // 응답엔 마감 시각 요약뿐이라 상세(관리)·홈 펀딩 카드의 진행·마감 상태는 다시 조회해 맞춘다
    onSuccess: (data, fundingId) => {
      queryClient.invalidateQueries({ queryKey: homeQueryKey });
      // 참여자 0명 종료(CANCELLED)는 관리 상세가 FUNDING_002를 돌려줘, 아직 마운트된 결과 화면이 재조회하면 에러가 뜬다. 대신 보관함에서 빠진 것을 반영한다
      if (data?.status === "CANCELLED") {
        queryClient.invalidateQueries({ queryKey: closedFundingsQueryKey });
        return;
      }
      queryClient.invalidateQueries({ queryKey: fundingManagementQueryKey(fundingId) });
    },
  });
};
