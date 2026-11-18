import {
  clearGiftVerificationBannerStorage,
  dismissGiftVerificationBanner,
  hasShownGiftVerificationCardBanner,
  isGiftVerificationBannerDismissed,
  markGiftVerificationCardBannerShown,
} from "@/utils/home/giftVerificationBannerStorage";

beforeEach(() => {
  sessionStorage.clear();
});

describe("giftVerificationBannerStorage", () => {
  it("아무것도 저장하지 않았다면 카드 표시·닫기 모두 false다", () => {
    expect(hasShownGiftVerificationCardBanner()).toBe(false);
    expect(isGiftVerificationBannerDismissed()).toBe(false);
  });

  it("카드형 표시를 기록하면 조회 결과가 true다", () => {
    markGiftVerificationCardBannerShown();

    expect(hasShownGiftVerificationCardBanner()).toBe(true);
  });

  it("닫기를 기록하면 조회 결과가 true다", () => {
    dismissGiftVerificationBanner();

    expect(isGiftVerificationBannerDismissed()).toBe(true);
  });

  it("clear하면 카드 표시·닫기 플래그가 모두 false로 돌아간다", () => {
    markGiftVerificationCardBannerShown();
    dismissGiftVerificationBanner();

    clearGiftVerificationBannerStorage();

    expect(hasShownGiftVerificationCardBanner()).toBe(false);
    expect(isGiftVerificationBannerDismissed()).toBe(false);
  });
});
