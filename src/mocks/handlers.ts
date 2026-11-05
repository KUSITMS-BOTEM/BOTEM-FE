import { http, HttpResponse } from "msw";

// 카카오 신규 유저 온보딩(profile-check → account-entry) 테스트용 — 계정 탈퇴 API가 없어 실제 카카오 계정으로는
// isNewUser: true를 재현할 수 없어 로그인 교환 응답만 가로채 고정한다. 그 외 요청(카카오 리다이렉트 등)은 그대로 흘려보낸다.
export const handlers = [
  http.post("/api/auth/kakao/login", () =>
    HttpResponse.json({
      success: true,
      data: { accessToken: "mock-access-token", isNewUser: true },
      error: null,
    }),
  ),
];
