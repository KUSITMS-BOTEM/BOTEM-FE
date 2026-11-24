const KAKAO_OAUTH_STATE_KEY = "kakaoOauthState";
const RETURN_PATH_SEPARATOR = ".";
const RECOVERABLE_RETURN_PATH_PREFIX = "/share/";

// iOS 인앱 브라우저(디스코드 등)에서 카카오톡 앱 로그인을 거치면 사파리로 돌아와 sessionStorage가 비지만,
// 카카오는 state를 그대로 돌려주므로 복귀 경로를 함께 싣는다
export const createKakaoOauthState = (returnPath?: string): string => {
  const nonce = crypto.randomUUID();
  return returnPath ? `${nonce}${RETURN_PATH_SEPARATOR}${returnPath}` : nonce;
};

// state는 URL로 들어와 조작될 수 있어, 공유 화면 경로만 되살린다
export const getReturnPathFromKakaoOauthState = (state: string): string | null => {
  const separatorIndex = state.indexOf(RETURN_PATH_SEPARATOR);
  if (separatorIndex === -1) return null;
  const path = state.slice(separatorIndex + 1);
  return path.startsWith(RECOVERABLE_RETURN_PATH_PREFIX) ? path : null;
};

export const setKakaoOauthState = (state: string) => {
  sessionStorage.setItem(KAKAO_OAUTH_STATE_KEY, state);
};

// 콜백에서 한 번만 대조하면 되므로 조회 즉시 제거한다 (재사용·재생 공격 방지).
export const consumeKakaoOauthState = (): string | null => {
  const state = sessionStorage.getItem(KAKAO_OAUTH_STATE_KEY);
  sessionStorage.removeItem(KAKAO_OAUTH_STATE_KEY);
  return state;
};
