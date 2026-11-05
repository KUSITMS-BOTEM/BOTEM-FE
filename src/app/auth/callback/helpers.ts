import type { useRouter } from "next/navigation";

import type { useKakaoLoginMutation } from "@/hooks/mutations/auth/useKakaoLoginMutation";
import { useAuthStore } from "@/store/authStore";
import { consumeKakaoOauthState } from "@/utils/kakaoOauthState";
import { setSignupFlow } from "@/utils/signupFlowStorage";

type KakaoLoginMutate = ReturnType<typeof useKakaoLoginMutation>["mutate"];
type Router = ReturnType<typeof useRouter>;

export const handleKakaoCallback = (
  code: string,
  state: string | null,
  mutate: KakaoLoginMutate,
  router: Router,
) => {
  if (!state || state !== consumeKakaoOauthState()) {
    router.replace("/");
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
        router.replace("/main");
      },
    },
  );
};
