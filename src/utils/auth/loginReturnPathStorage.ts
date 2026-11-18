const LOGIN_RETURN_PATH_KEY = "loginReturnPath";

// "//evil.com"처럼 프로토콜 상대 URL은 외부로 나가므로 앱 내부 절대 경로만 허용한다
const isInternalPath = (path: string) => path.startsWith("/") && !path.startsWith("//");

export const setLoginReturnPath = (path: string) => {
  if (!isInternalPath(path)) return;
  sessionStorage.setItem(LOGIN_RETURN_PATH_KEY, path);
};

export const clearLoginReturnPath = () => {
  sessionStorage.removeItem(LOGIN_RETURN_PATH_KEY);
};

// 한 번 복귀하면 이후 로그인에 남지 않도록 조회 즉시 제거한다
export const consumeLoginReturnPath = (): string | null => {
  const path = sessionStorage.getItem(LOGIN_RETURN_PATH_KEY);
  clearLoginReturnPath();
  return path && isInternalPath(path) ? path : null;
};
