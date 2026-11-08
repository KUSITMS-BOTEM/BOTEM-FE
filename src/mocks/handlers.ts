import { delay, http, HttpResponse } from "msw";

// proxy.ts는 refreshToken 쿠키 존재 여부만 보는데, MSW는 응답 바디만 가로채고 실제 백엔드의 Set-Cookie를 거치지 않아
// 로그인 흉내만으론 /main 가드를 통과하지 못한다. 핸들러 안에서 직접 document.cookie를 심어 흉내 낸다.
const MOCK_REFRESH_TOKEN_COOKIE = "refreshToken";

// 평범한 문자열이면 isTokenExpired가 JWT로 파싱하지 못해 항상 만료로 보고 매 요청마다 reissue를 탄다
// (reissue는 mock이 없어 실제 백엔드로 릴레이되다 가짜 쿠키라 401) — exp가 먼 미래인 JWT 형태로 흉내 낸다.
const createMockAccessToken = () => {
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 60 * 60 }));
  return `mock.${payload}.signature`;
};

// 카카오 신규 유저 온보딩(profile-check → payout-account) 테스트용 — 계정 탈퇴 API가 없어 실제 카카오 계정으로는
// isNewUser: true를 재현할 수 없어 로그인 교환 응답만 가로채 고정한다. 그 외 요청(카카오 리다이렉트 등)은 그대로 흘려보낸다.
export const handlers = [
  http.post("/api/auth/kakao/login", async () => {
    // 실제 네트워크 왕복 없이 응답이 바로 와서 /auth/callback 경유 화면이 깜빡할 새도 없이 지나가버린다 — 눈으로 보려고 지연을 둔다.
    await delay(1000);
    document.cookie = `${MOCK_REFRESH_TOKEN_COOKIE}=mock-refresh-token; path=/`;

    return HttpResponse.json({
      success: true,
      data: { accessToken: createMockAccessToken(), isNewUser: true },
      error: null,
    });
  }),
  http.post("/api/auth/logout", () => {
    document.cookie = `${MOCK_REFRESH_TOKEN_COOKIE}=; path=/; max-age=0`;

    return HttpResponse.json({ success: true, data: null, error: null });
  }),
  // NEXT_PUBLIC_API_BASE_URL(절대 cross-origin URL)로 나가는 요청이라 origin 무관 매칭(`*/`)이 필요하다
  http.get("*/api/users/me/profile", () => {
    return HttpResponse.json({
      success: true,
      data: {
        nickname: "지유",
        profileImageUrl: "https://example.com/profile.jpg",
        birthday: "10-13",
        wishProfileUrl: "https://botem.site/@8f0c6d779fae47f3a979302f2782d20f",
        kakaoConnected: true,
      },
      error: null,
    });
  }),
];
