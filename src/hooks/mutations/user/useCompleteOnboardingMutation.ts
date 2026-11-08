import { useMutation } from "@tanstack/react-query";

import { userService } from "@/apis/user/userService";

export const useCompleteOnboardingMutation = () =>
  useMutation({
    mutationFn: userService.completeOnboarding,
    // 실패 시 이 화면에서 직접 alert·리다이렉트를 처리하므로 전역 에러 alert는 건너뛴다
    meta: { skipGlobalError: true },
  });
