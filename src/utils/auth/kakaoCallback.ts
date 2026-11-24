import type { useRouter } from "next/navigation";

import type { useKakaoLoginMutation } from "@/hooks/mutations/auth/useKakaoLoginMutation";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { useAuthStore } from "@/store/authStore";
import { useErrorDialogStore } from "@/store/errorDialogStore";
import {
  consumeKakaoOauthState,
  getReturnPathFromKakaoOauthState,
} from "@/utils/auth/kakaoOauthState";
import { consumeLoginReturnPath, setLoginReturnPath } from "@/utils/auth/loginReturnPathStorage";
import { setSignupFlow } from "@/utils/auth/signupFlowStorage";
import { clearGiftVerificationBannerStorage } from "@/utils/home/giftVerificationBannerStorage";

type KakaoLoginMutate = ReturnType<typeof useKakaoLoginMutation>["mutate"];
type Router = ReturnType<typeof useRouter>;

const FAILURE_REDIRECT_DELAY_MS = 3000;

// 콜백 실패 시 화면에 머물지 않도록, 안내 Dialog를 띄우고 랜딩으로 되돌린다.
export const redirectToLandingAfterFailure = (router: Router) => {
  setTimeout(() => {
    useErrorDialogStore.getState().openErrorDialog(ERROR_MESSAGES.AUTH_004.message);
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
    // 브라우저가 바뀌어 검증에 실패해도 다시 로그인하면 공유 화면으로 돌아가게 한다. code는 교환하지 않는다
    const returnPath = state && getReturnPathFromKakaoOauthState(state);
    if (returnPath) setLoginReturnPath(returnPath);
    redirectToLandingAfterFailure(router);
    return;
  }

  mutate(
    { code, redirectUri: `${window.location.origin}/auth/callback` },
    {
      onSuccess: data => {
        if (!data) return;
        useAuthStore.getState().setAccessToken(data.accessToken);
        clearGiftVerificationBannerStorage();

        if (data.isNewUser) {
          setSignupFlow({ step: "profile" });
          router.replace("/auth/profile-check");
          return;
        }
        router.replace(consumeLoginReturnPath() ?? "/home");
      },
      onError: () => redirectToLandingAfterFailure(router),
    },
  );
};
