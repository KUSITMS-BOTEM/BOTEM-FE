import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";

import { userService } from "@/apis/user/userService";
import { queryClient } from "@/lib/queryClient";
import { clearSignupFlow } from "@/utils/signupFlowStorage";
import { markWishPromptPending } from "@/utils/wishPromptStorage";

export const useCompleteOnboardingMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: userService.completeOnboarding,
    // 실패 시 이 화면에서 직접 alert·리다이렉트를 처리하므로 전역 에러 alert는 건너뛴다
    meta: { skipGlobalError: true },
    // onSuccess/onError를 훅 레벨에 둬야 호출 화면이 언마운트돼도 실행된다 (mutate에 넘긴 콜백은 언마운트 시 미실행)
    onSuccess: () => {
      clearSignupFlow();
      markWishPromptPending();
      router.replace("/main");
    },
    onError: () => {
      alert("에러가 발생했습니다");
      queryClient.removeQueries({ queryKey: ["users", "me"] });
      router.replace("/");
    },
  });
};
