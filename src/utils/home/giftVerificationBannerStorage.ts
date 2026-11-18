const CARD_SHOWN_KEY = "giftVerificationBanner:cardShown";
const DISMISSED_KEY = "giftVerificationBanner:dismissed";

// 서비스에 들어올 때마다(탭 세션) 카드형을 한 번만 보여주므로 sessionStorage에 둔다
export const hasShownGiftVerificationCardBanner = () =>
  sessionStorage.getItem(CARD_SHOWN_KEY) === "true";

export const markGiftVerificationCardBannerShown = () =>
  sessionStorage.setItem(CARD_SHOWN_KEY, "true");

export const isGiftVerificationBannerDismissed = () =>
  sessionStorage.getItem(DISMISSED_KEY) === "true";

export const dismissGiftVerificationBanner = () => sessionStorage.setItem(DISMISSED_KEY, "true");

// 같은 탭에서 다시 로그인하면 새로 들어온 것으로 보고 카드형부터 다시 보여준다
export const clearGiftVerificationBannerStorage = () => {
  sessionStorage.removeItem(CARD_SHOWN_KEY);
  sessionStorage.removeItem(DISMISSED_KEY);
};
