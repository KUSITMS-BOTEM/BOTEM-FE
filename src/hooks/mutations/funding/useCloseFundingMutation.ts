import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";
import { fundingManagementQueryKey } from "@/hooks/queries/funding/useFundingManagementQuery";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";

export const useCloseFundingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fundingService.closeFunding,
    // 응답엔 마감 시각 요약뿐이라 상세(관리)·홈 펀딩 카드의 진행·마감 상태는 다시 조회해 맞춘다
    onSuccess: (_data, fundingId) => {
      queryClient.invalidateQueries({ queryKey: fundingManagementQueryKey(fundingId) });
      queryClient.invalidateQueries({ queryKey: homeQueryKey });
    },
  });
};
