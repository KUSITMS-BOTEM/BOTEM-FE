const LOGIN_RETURN_PATH_KEY = "loginReturnPath";

// "//evil.com"·"/\evil.com"(브라우저가 \를 /로 해석)은 외부로 나가므로 앱 내부 절대 경로만 허용한다
const isInternalPath = (path: string) =>
  path.startsWith("/") && !path.startsWith("//") && !path.includes("\\");

export const setLoginReturnPath = (path: string) => {
  if (!isInternalPath(path)) return;
  sessionStorage.setItem(LOGIN_RETURN_PATH_KEY, path);
};

export const clearLoginReturnPath = () => {
  sessionStorage.removeItem(LOGIN_RETURN_PATH_KEY);
};

// 지우지 않고 읽기만 한다 — 랜딩 로그인 버튼이 만료 직전에 저장된 경로를 이어받을 때 쓴다
export const getLoginReturnPath = (): string | null => {
  const path = sessionStorage.getItem(LOGIN_RETURN_PATH_KEY);
  return path && isInternalPath(path) ? path : null;
};

// 한 번 복귀하면 이후 로그인에 남지 않도록 조회 즉시 제거한다
export const consumeLoginReturnPath = (): string | null => {
  const path = getLoginReturnPath();
  clearLoginReturnPath();
  return path;
};
