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
