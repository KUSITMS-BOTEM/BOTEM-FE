import type { useKakaoLoginUriMutation } from "@/hooks/mutations/auth/useKakaoLoginUriMutation";
import { setKakaoOauthState } from "@/utils/auth/kakaoOauthState";
import { clearSignupFlow } from "@/utils/auth/signupFlowStorage";

type LoginUriMutate = ReturnType<typeof useKakaoLoginUriMutation>["mutate"];

const KAKAO_AUTH_HOST = "kauth.kakao.com";

export const handleKakaoLoginClick = (mutate: LoginUriMutate) => {
  clearSignupFlow();

  mutate(`${window.location.origin}/auth/callback`, {
    onSuccess: data => {
      if (!data) return;
      const url = new URL(data.loginUri);
      // 같은 origin은 MSW가 돌려주는 mock 콜백 URL이다. 운영에서는 응답이 오염돼도 state 검증이 우회되지 않도록 카카오 host만 허용한다.
      const isMockCallback =
        process.env.NODE_ENV !== "production" &&
        process.env.NEXT_PUBLIC_MSW_ENABLED === "1" &&
        url.origin === window.location.origin;
      if (url.host !== KAKAO_AUTH_HOST && !isMockCallback) return;

      // 카카오가 콜백에 그대로 되돌려주는 state를 심어, 공격자가 자기 code를 피해자에게 심는 login CSRF를 막는다.
      const state = crypto.randomUUID();
      url.searchParams.set("state", state);
      setKakaoOauthState(state);

      window.location.href = url.toString();
    },
  });
};
