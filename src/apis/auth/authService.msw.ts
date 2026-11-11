import { delay, http, HttpResponse } from "msw";

import { clearMockAuthCookies, setMockAuthCookies } from "@/mocks/mockAuthCookies";

// 평범한 문자열이면 isTokenExpired가 JWT로 파싱하지 못해 항상 만료로 보고 매 요청마다 reissue를 탄다
// — exp가 먼 미래인 JWT 형태로 흉내 낸다.
const createMockAccessToken = () => {
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 60 * 60 }));
  return `mock.${payload}.signature`;
};

// 카카오 신규/기존 유저 온보딩 분기 테스트용 — 계정 탈퇴 API가 없어 실제 카카오 계정으로는 isNewUser 값을
// 임의로 재현할 수 없어 로그인 교환 응답만 가로채 code 값으로 분기한다.
export const EXISTING_USER_KAKAO_CODE = "existing-user-code";
// 클라이언트(src/app/helpers.ts)가 이 host인지만 검사해 그대로 리다이렉트하므로, e2e에서 실제 카카오 동의 화면 대신
// page.route로 가로챌 수 있도록 kauth.kakao.com host를 유지한다.
export const MOCK_KAKAO_LOGIN_URI = "https://kauth.kakao.com/oauth/authorize?client_id=mock";

export const authHandlers = [
  // getKakaoLoginUri는 cross-origin 절대 URL로 나가 MSW 서비스워커가 자체적으로 네트워크에 흘려보내므로,
  // Playwright page.route로는 가로챌 수 없다 — 반드시 MSW 핸들러로 응답해야 한다.
  http.get("*/api/auth/kakao/login-uri", () => {
    return HttpResponse.json({
      success: true,
      data: { loginUri: MOCK_KAKAO_LOGIN_URI },
      error: null,
    });
  }),
  http.post("/api/auth/kakao/login", async ({ request }) => {
    // 실제 네트워크 왕복 없이 응답이 바로 와서 /auth/callback 경유 화면이 깜빡할 새도 없이 지나가버린다 — 눈으로 보려고 지연을 둔다.
    await delay(1000);
    setMockAuthCookies();

    const { code } = (await request.json()) as { code: string };

    return HttpResponse.json({
      success: true,
      data: { accessToken: createMockAccessToken(), isNewUser: code !== EXISTING_USER_KAKAO_CODE },
      error: null,
    });
  }),
  // mock 로그인 상태(가짜 refreshToken 쿠키)로도 accessToken 만료 → 재발급 → 원요청 재시도 흐름을 테스트할 수 있게 한다
  http.post("/api/auth/reissue", async () => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: { accessToken: createMockAccessToken() },
      error: null,
    });
  }),
  http.post("/api/auth/logout", () => {
    clearMockAuthCookies();

    return HttpResponse.json({ success: true, data: null, error: null });
  }),
];
