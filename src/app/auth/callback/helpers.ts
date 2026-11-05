import type { useRouter } from "next/navigation";

import type { useKakaoLoginMutation } from "@/hooks/mutations/auth/useKakaoLoginMutation";
import { useAuthStore } from "@/store/authStore";
import { setSignupFlow } from "@/utils/signupFlowStorage";

type KakaoLoginMutate = ReturnType<typeof useKakaoLoginMutation>["mutate"];
type Router = ReturnType<typeof useRouter>;

export const handleKakaoCallback = (code: string, mutate: KakaoLoginMutate, router: Router) => {
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
