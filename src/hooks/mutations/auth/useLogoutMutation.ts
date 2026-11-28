import { useMutation } from "@tanstack/react-query";

import { authService } from "@/apis/auth/authService";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";
import { useGuestBotemStore } from "@/store/guestBotemStore";
import { clearWishPromptPending } from "@/utils/wish/wishPromptStorage";

export const useLogoutMutation = () =>
  useMutation({
    mutationFn: authService.postLogout,
    onSuccess: () => {
      useAuthStore.getState().markSignedOut();
      queryClient.removeQueries({ queryKey: ["users", "me"] });
      queryClient.removeQueries({ queryKey: ["friends"] });
      // 이전 계정의 내 보탬 조회 결과가 같은 공유 링크에서 다음 방문자에게 쓰이지 않게 한다
      queryClient.removeQueries({
        queryKey: ["fundings", "share"],
        predicate: ({ queryKey }) => queryKey[3] === "contributions",
      });
      clearWishPromptPending();
      // 비회원 비밀번호가 로그아웃 뒤에도 메모리에 남지 않게 한다
      useGuestBotemStore.getState().reset();
    },
  });
