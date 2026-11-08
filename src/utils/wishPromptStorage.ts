const WISH_PROMPT_KEY = "shouldShowWishPrompt";

export const markWishPromptPending = () => {
  sessionStorage.setItem(WISH_PROMPT_KEY, "true");
};

export const consumeWishPromptPending = (): boolean => {
  const pending = sessionStorage.getItem(WISH_PROMPT_KEY) === "true";
  sessionStorage.removeItem(WISH_PROMPT_KEY);
  return pending;
};
