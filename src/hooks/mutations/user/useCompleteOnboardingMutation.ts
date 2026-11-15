import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";

import { userService } from "@/apis/user/userService";
import { queryClient, showErrorDialogThen } from "@/lib/queryClient";
import { clearSignupFlow } from "@/utils/auth/signupFlowStorage";
import { markWishPromptPending } from "@/utils/wish/wishPromptStorage";

export const useCompleteOnboardingMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: userService.completeOnboarding,
    // 실패 시 Dialog 노출과 리다이렉트를 함께 처리하므로 전역 onError는 건너뛴다
    meta: { skipGlobalError: true },
    // onSuccess/onError를 훅 레벨에 둬야 호출 화면이 언마운트돼도 실행된다 (mutate에 넘긴 콜백은 언마운트 시 미실행)
    onSuccess: () => {
      clearSignupFlow();
      // 보류: 온보딩 직후 home에서 보여줄 화면이 미정이라 플래그만 켜두고 현재는 읽는 곳이 없다
      markWishPromptPending();
      router.replace("/home");
    },
    onError: error => {
      queryClient.removeQueries({ queryKey: ["users", "me"] });
      // 사용자가 Dialog 확인을 눌러야 랜딩으로 이동한다. action(inline·redirect 포함)과 무관하게 항상 안내한다
      showErrorDialogThen(error, () => router.replace("/"));
    },
  });
};
