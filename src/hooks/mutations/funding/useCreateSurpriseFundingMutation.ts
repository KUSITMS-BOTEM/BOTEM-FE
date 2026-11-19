import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";
import { friendsQueryKey } from "@/hooks/queries/friend/useFriendsQuery";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";
import type { CreateSurpriseFundingRequest } from "@/types/funding/funding";

export const useCreateSurpriseFundingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateSurpriseFundingRequest) => {
      const created = await fundingService.postSurpriseFunding(body);
      // 이동할 펀딩 상세가 fundingId를 필요로 하므로 빈 응답은 실패로 다룬다
      if (!created) throw new Error("서프라이즈 펀딩 개설 응답이 비어 있어요");
      return created;
    },
    // 응답엔 개설된 펀딩 요약뿐이라 무효화한다. 친구 목록·프로필의 펀딩 중 표시와 홈 목록이 개설 전 값을 읽지 않게 이동보다 먼저 호출한다
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendsQueryKey });
      queryClient.invalidateQueries({ queryKey: homeQueryKey });
    },
  });
};
