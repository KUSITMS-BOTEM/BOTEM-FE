import { clientApi } from "@/apis/client";

type KakaoLoginUriResponse = {
  loginUri: string;
};

type KakaoLoginRequest = {
  code: string;
  redirectUri: string;
};

type KakaoLoginResponse = {
  accessToken: string;
  isNewUser: boolean;
};

export const authService = {
  getKakaoLoginUri: (redirectUri: string) =>
    clientApi.get<KakaoLoginUriResponse>("/api/auth/kakao/login-uri", { redirectUri }),
  postKakaoLogin: (body: KakaoLoginRequest) =>
    clientApi.postAuth<KakaoLoginResponse>("/api/auth/kakao/login", body),
  postLogout: () => clientApi.postAuth<null>("/api/auth/logout"),
};
