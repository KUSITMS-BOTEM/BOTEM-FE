// proxy.ts는 isLoggedIn 쿠키 존재 여부만 보는데, MSW는 응답 바디만 가로채고 실제 백엔드의 Set-Cookie를 거치지 않아
// 로그인 흉내만으론 /home 가드를 통과하지 못한다. 핸들러 안에서 직접 document.cookie를 심어 흉내 낸다.
const MOCK_REFRESH_TOKEN_COOKIE = "refreshToken";
const MOCK_IS_LOGGED_IN_COOKIE = "isLoggedIn";

export const setMockAuthCookies = () => {
  document.cookie = `${MOCK_REFRESH_TOKEN_COOKIE}=mock-refresh-token; path=/`;
  document.cookie = `${MOCK_IS_LOGGED_IN_COOKIE}=true; path=/`;
};

export const clearMockAuthCookies = () => {
  document.cookie = `${MOCK_REFRESH_TOKEN_COOKIE}=; path=/; max-age=0`;
  document.cookie = `${MOCK_IS_LOGGED_IN_COOKIE}=; path=/; max-age=0`;
};
