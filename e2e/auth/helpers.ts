import type { Page } from "@playwright/test";

const KAKAO_AUTH_HOST_PATTERN = /^https:\/\/kauth\.kakao\.com\//;

// 실제 카카오 동의 화면은 외부 도메인이라 열 수 없어, 동의까지 끝낸 것처럼 카카오가 돌려주는 리다이렉트를 그대로 흉내낸다.
// (getKakaoLoginUri 응답 자체는 MSW 서비스워커가 가로채 네트워크로 흘려보내 page.route가 못 잡으므로 src/mocks/handlers.ts에서 모킹한다)
// state는 CSRF 방지용으로 클라이언트가 심은 값을 카카오가 그대로 되돌려주는 동작까지 재현해야 하므로, 요청 쿼리에서 그대로 읽어 echo한다.
export const mockKakaoConsentRedirect = (page: Page, baseURL: string, code: string) =>
  page.route(KAKAO_AUTH_HOST_PATTERN, route => {
    const state = new URL(route.request().url()).searchParams.get("state");
    return route.fulfill({
      status: 302,
      headers: { location: `${baseURL}/auth/callback?code=${code}&state=${state}` },
    });
  });
