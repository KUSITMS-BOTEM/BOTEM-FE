const KAKAO_OAUTH_STATE_KEY = "kakaoOauthState";

export const setKakaoOauthState = (state: string) => {
  sessionStorage.setItem(KAKAO_OAUTH_STATE_KEY, state);
};

// 콜백에서 한 번만 대조하면 되므로 조회 즉시 제거한다 (재사용·재생 공격 방지).
export const consumeKakaoOauthState = (): string | null => {
  const state = sessionStorage.getItem(KAKAO_OAUTH_STATE_KEY);
  sessionStorage.removeItem(KAKAO_OAUTH_STATE_KEY);
  return state;
};
