"use client";

import { useState, type ReactNode } from "react";

import { useRouter } from "next/navigation";

import { useGiftVerificationBannerQuery } from "@/hooks/queries/home/useGiftVerificationBannerQuery";
import {
  type GiftVerificationBannerVariant,
  useGiftVerificationBannerSession,
} from "@/hooks/useGiftVerificationBannerSession";
import GiftVerificationBottomSheet from "@/widgets/home/GiftVerificationBottomSheet";
import GiftVerificationCardBanner from "@/widgets/home/GiftVerificationCardBanner";
import GiftVerificationPinnedBanner from "@/widgets/home/GiftVerificationPinnedBanner";

type GiftVerificationBannerLayerProps = {
  variant: GiftVerificationBannerVariant;
  // giftBannerActive: 선물 인증 배너가 아직 떠 있는지. 열거나 닫으면 false가 돼 다른 배너(서프라이즈)가 이어서 뜬다
  children: (cardBanner: ReactNode, giftBannerActive: boolean) => ReactNode;
};

export default function GiftVerificationBannerLayer({
  variant,
  children,
}: GiftVerificationBannerLayerProps) {
  const router = useRouter();
  const { data } = useGiftVerificationBannerQuery();
  const pendingCount = data?.visible ? data.pendingCount : 0;
  const { visible, dismiss, markCardShown } = useGiftVerificationBannerSession({
    hasPending: pendingCount > 0,
  });
  const [sheetOpen, setSheetOpen] = useState(false);
  // 인증하러 가기로 시트를 열었으면 이번 방문에선 배너를 내리고 다음 배너에 자리를 넘긴다
  const [verifyOpened, setVerifyOpened] = useState(false);
  const active = visible && !verifyOpened;

  const bannerProps = {
    count: pendingCount,
    onVerify: () => {
      setSheetOpen(true);
      setVerifyOpened(true);
    },
    onClose: dismiss,
  };

  return (
    <div className="relative w-full">
      {active && variant === "pinned" && <GiftVerificationPinnedBanner {...bannerProps} />}
      {children(
        active && variant === "card" ? (
          <GiftVerificationCardBanner {...bannerProps} onShown={markCardShown} />
        ) : null,
        active,
      )}
      <GiftVerificationBottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onVerify={fundingId => router.push(`/funding/${fundingId}/verify`)}
      />
    </div>
  );
}
