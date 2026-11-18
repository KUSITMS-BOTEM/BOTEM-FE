import { useEffect, useState } from "react";

import {
  dismissGiftVerificationBanner,
  hasShownGiftVerificationCardBanner,
  isGiftVerificationBannerDismissed,
  markGiftVerificationCardBannerShown,
} from "@/utils/home/giftVerificationBannerStorage";

export type GiftVerificationBannerVariant = "card" | "pinned";

// 세션 첫 노출은 카드형, 이후 홈 진입부터는 상단 고정형.
// 홈 안에서 탭을 오가도 형태가 바뀌지 않도록 홈 화면이 살아 있는 동안 유지되는 곳(HomeContainer)에서 한 번만 정한다
export function useGiftVerificationBannerVariant(): GiftVerificationBannerVariant {
  const [variant] = useState<GiftVerificationBannerVariant>(() =>
    typeof window !== "undefined" && hasShownGiftVerificationCardBanner() ? "pinned" : "card",
  );
  return variant;
}

export function useGiftVerificationBannerSession({
  hasPending,
  variant,
}: {
  hasPending: boolean;
  variant: GiftVerificationBannerVariant;
}) {
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && isGiftVerificationBannerDismissed(),
  );
  const visible = hasPending && !dismissed;

  // 인증 대기가 실제로 보였을 때만 "본 것"으로 기록해야 대기가 생긴 첫 진입에 카드형이 뜬다
  useEffect(() => {
    if (visible && variant === "card") markGiftVerificationCardBannerShown();
  }, [visible, variant]);

  const dismiss = () => {
    dismissGiftVerificationBanner();
    setDismissed(true);
  };

  return { visible, dismiss };
}
