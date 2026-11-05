import { http, HttpResponse } from "msw";

// proxy.ts는 refreshToken 쿠키 존재 여부만 보는데, MSW는 응답 바디만 가로채고 실제 백엔드의 Set-Cookie를 거치지 않아
// 로그인 흉내만으론 /main 가드를 통과하지 못한다. 핸들러 안에서 직접 document.cookie를 심어 흉내 낸다.
const MOCK_REFRESH_TOKEN_COOKIE = "refreshToken";

// 카카오 신규 유저 온보딩(profile-check → account-entry) 테스트용 — 계정 탈퇴 API가 없어 실제 카카오 계정으로는
// isNewUser: true를 재현할 수 없어 로그인 교환 응답만 가로채 고정한다. 그 외 요청(카카오 리다이렉트 등)은 그대로 흘려보낸다.
export const handlers = [
  http.post("/api/auth/kakao/login", () => {
    document.cookie = `${MOCK_REFRESH_TOKEN_COOKIE}=mock-refresh-token; path=/`;

    return HttpResponse.json({
      success: true,
      data: { accessToken: "mock-access-token", isNewUser: true },
      error: null,
    });
  }),
  http.post("/api/auth/logout", () => {
    document.cookie = `${MOCK_REFRESH_TOKEN_COOKIE}=; path=/; max-age=0`;

    return HttpResponse.json({ success: true, data: null, error: null });
  }),
];
