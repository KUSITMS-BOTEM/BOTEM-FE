import { useMutation } from "@tanstack/react-query";

import { userService } from "@/apis/user/userService";
import { queryClient } from "@/lib/queryClient";

export const useUpdateMyProfileMutation = () =>
  useMutation({
    mutationFn: userService.updateMyProfile,
    // 응답이 수정된 프로필 전체라 재조회 없이 캐시를 바로 교체한다 (프로필 쿼리는 staleTime: Infinity)
    onSuccess: profile => queryClient.setQueryData(["users", "me", "profile"], profile),
  });
