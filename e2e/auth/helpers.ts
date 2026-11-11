import type { Page } from "@playwright/test";

// MSW login-uri 응답은 항상 new-user-code 콜백으로 보낸다(src/apis/auth/authService.msw.ts).
// MSW 서비스워커가 same-origin 요청을 먼저 가로채 page.route로는 이 이동의 code를 바꿀 수 없어, 다른 code가 필요하면
// 클라이언트가 심는 state(sessionStorage)를 직접 심고 콜백에 곧바로 진입한다. state는 콜백이 대조하므로 같은 값을 쿼리에 실어야 한다.
const KAKAO_OAUTH_STATE_KEY = "kakaoOauthState";

export const gotoKakaoCallback = async (page: Page, code: string) => {
  const state = "e2e-state";

  await page.goto("/");
  await page.evaluate(
    ([key, value]) => sessionStorage.setItem(key, value),
    [KAKAO_OAUTH_STATE_KEY, state],
  );
  await page.goto(`/auth/callback?code=${code}&state=${state}`);
};
