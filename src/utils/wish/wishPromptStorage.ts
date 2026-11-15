// 보류: 가입 온보딩을 마친 사용자가 home에 들어왔을 때 어떤 화면을 보여줄지 아직 정해지지 않아
// 현재는 이 플래그를 읽는 곳이 없다. 로직 자체는 지우지 않고 남겨둔다.
const WISH_PROMPT_KEY = "shouldShowWishPrompt";

export const markWishPromptPending = () => {
  sessionStorage.setItem(WISH_PROMPT_KEY, "true");
};

export const consumeWishPromptPending = (): boolean => {
  // HomeContainer의 useState 초기화 함수에서 렌더 중(SSR 포함) 호출돼 서버 환경 가드가 필요하다
  if (typeof window === "undefined") return false;
  const pending = sessionStorage.getItem(WISH_PROMPT_KEY) === "true";
  sessionStorage.removeItem(WISH_PROMPT_KEY);
  return pending;
};

export const clearWishPromptPending = () => {
  sessionStorage.removeItem(WISH_PROMPT_KEY);
};
