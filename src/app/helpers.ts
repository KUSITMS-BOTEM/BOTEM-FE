import type { useKakaoLoginUriMutation } from "@/hooks/mutations/auth/useKakaoLoginUriMutation";
import { clearSignupFlow } from "@/utils/signupFlowStorage";

type LoginUriMutate = ReturnType<typeof useKakaoLoginUriMutation>["mutate"];

const KAKAO_AUTH_HOST = "kauth.kakao.com";

export const handleKakaoLoginClick = (mutate: LoginUriMutate) => {
  clearSignupFlow();

  mutate(`${window.location.origin}/auth/callback`, {
    onSuccess: data => {
      if (!data || new URL(data.loginUri).host !== KAKAO_AUTH_HOST) return;
      window.location.href = data.loginUri;
    },
  });
};
