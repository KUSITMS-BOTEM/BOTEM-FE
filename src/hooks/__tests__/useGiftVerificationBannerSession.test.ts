import { act, renderHook } from "@testing-library/react";

import {
  useGiftVerificationBannerSession,
  useGiftVerificationBannerVariant,
} from "@/hooks/useGiftVerificationBannerSession";
import {
  clearGiftVerificationBannerStorage,
  dismissGiftVerificationBanner,
  hasShownGiftVerificationCardBanner,
  markGiftVerificationCardBannerShown,
} from "@/utils/home/giftVerificationBannerStorage";

beforeEach(() => {
  sessionStorage.clear();
});

describe("useGiftVerificationBannerVariant", () => {
  it("세션 기록이 비어 있으면 카드형이다", () => {
    const { result } = renderHook(() => useGiftVerificationBannerVariant());

    expect(result.current).toBe("card");
  });

  it("이미 카드형을 본 세션이면 고정형이다", () => {
    markGiftVerificationCardBannerShown();

    const { result } = renderHook(() => useGiftVerificationBannerVariant());

    expect(result.current).toBe("pinned");
  });

  it("마운트된 동안에는 표시 기록이 생겨도 처음 정한 형태를 유지한다", () => {
    const { result, rerender } = renderHook(() => useGiftVerificationBannerVariant());

    markGiftVerificationCardBannerShown();
    rerender();

    expect(result.current).toBe("card");
  });

  it("로그인으로 기록이 초기화되면 다시 카드형부터 시작한다", () => {
    markGiftVerificationCardBannerShown();
    clearGiftVerificationBannerStorage();

    const { result } = renderHook(() => useGiftVerificationBannerVariant());

    expect(result.current).toBe("card");
  });
});

describe("useGiftVerificationBannerSession", () => {
  it("카드형이고 인증 대기가 있으면 보이며 표시 기록을 남긴다", () => {
    const { result } = renderHook(() =>
      useGiftVerificationBannerSession({ hasPending: true, variant: "card" }),
    );

    expect(result.current.visible).toBe(true);
    expect(hasShownGiftVerificationCardBanner()).toBe(true);
  });

  it("고정형이면 표시 기록을 새로 남기지 않는다", () => {
    const { result } = renderHook(() =>
      useGiftVerificationBannerSession({ hasPending: true, variant: "pinned" }),
    );

    expect(result.current.visible).toBe(true);
    expect(hasShownGiftVerificationCardBanner()).toBe(false);
  });

  it("인증 대기가 없으면 보이지 않고 표시 기록도 남기지 않는다", () => {
    const { result } = renderHook(() =>
      useGiftVerificationBannerSession({ hasPending: false, variant: "card" }),
    );

    expect(result.current.visible).toBe(false);
    expect(hasShownGiftVerificationCardBanner()).toBe(false);
  });

  it("dismiss를 호출하면 보이지 않는다", () => {
    const { result } = renderHook(() =>
      useGiftVerificationBannerSession({ hasPending: true, variant: "card" }),
    );

    act(() => result.current.dismiss());

    expect(result.current.visible).toBe(false);
  });

  it("이번 세션에 닫았다면 다시 마운트돼도 보이지 않는다", () => {
    dismissGiftVerificationBanner();

    const { result } = renderHook(() =>
      useGiftVerificationBannerSession({ hasPending: true, variant: "pinned" }),
    );

    expect(result.current.visible).toBe(false);
  });
});
