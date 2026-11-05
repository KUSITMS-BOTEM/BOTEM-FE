import type { useKakaoLoginUriMutation } from "@/hooks/mutations/auth/useKakaoLoginUriMutation";
import { setKakaoOauthState } from "@/utils/kakaoOauthState";
import { clearSignupFlow } from "@/utils/signupFlowStorage";

type LoginUriMutate = ReturnType<typeof useKakaoLoginUriMutation>["mutate"];

const KAKAO_AUTH_HOST = "kauth.kakao.com";

export const handleKakaoLoginClick = (mutate: LoginUriMutate) => {
  clearSignupFlow();

  mutate(`${window.location.origin}/auth/callback`, {
    onSuccess: data => {
      if (!data) return;
      const url = new URL(data.loginUri);
      if (url.host !== KAKAO_AUTH_HOST) return;

      // 카카오가 콜백에 그대로 되돌려주는 state를 심어, 공격자가 자기 code를 피해자에게 심는 login CSRF를 막는다.
      const state = crypto.randomUUID();
      url.searchParams.set("state", state);
      setKakaoOauthState(state);

      window.location.href = url.toString();
    },
  });
};
