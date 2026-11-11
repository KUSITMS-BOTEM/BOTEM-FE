import type { useRouter } from "next/navigation";

import type { useKakaoLoginMutation } from "@/hooks/mutations/auth/useKakaoLoginMutation";
import { useAuthStore } from "@/store/authStore";
import { consumeKakaoOauthState } from "@/utils/kakaoOauthState";
import { setSignupFlow } from "@/utils/signupFlowStorage";

type KakaoLoginMutate = ReturnType<typeof useKakaoLoginMutation>["mutate"];
type Router = ReturnType<typeof useRouter>;

const FAILURE_REDIRECT_DELAY_MS = 3000;

// 콜백 실패 시 화면에 머물지 않도록, 안내 후 랜딩으로 되돌린다.
export const redirectToLandingAfterFailure = (router: Router) => {
  setTimeout(() => {
    alert("로그인에 실패했습니다. 다시 시도해주세요.");
    router.replace("/");
  }, FAILURE_REDIRECT_DELAY_MS);
};

export const handleKakaoCallback = (
  code: string,
  state: string | null,
  mutate: KakaoLoginMutate,
  router: Router,
) => {
  if (!state || state !== consumeKakaoOauthState()) {
    redirectToLandingAfterFailure(router);
    return;
  }

  mutate(
    { code, redirectUri: `${window.location.origin}/auth/callback` },
    {
      onSuccess: data => {
        if (!data) return;
        useAuthStore.getState().setAccessToken(data.accessToken);

        if (data.isNewUser) {
          setSignupFlow({ step: "profile" });
          router.replace("/auth/profile-check");
          return;
        }
        router.replace("/home");
      },
      onError: () => redirectToLandingAfterFailure(router),
    },
  );
};
