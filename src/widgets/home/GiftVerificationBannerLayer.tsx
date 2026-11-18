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
  children: (cardBanner: ReactNode) => ReactNode;
};

export default function GiftVerificationBannerLayer({
  variant,
  children,
}: GiftVerificationBannerLayerProps) {
  const router = useRouter();
  const { data } = useGiftVerificationBannerQuery();
  const pendingCount = data?.visible ? data.pendingCount : 0;
  const { visible, dismiss } = useGiftVerificationBannerSession({
    hasPending: pendingCount > 0,
    variant,
  });
  const [sheetOpen, setSheetOpen] = useState(false);

  const bannerProps = { count: pendingCount, onVerify: () => setSheetOpen(true), onClose: dismiss };

  return (
    <div className="relative w-full">
      {visible && variant === "pinned" && <GiftVerificationPinnedBanner {...bannerProps} />}
      {children(
        visible && variant === "card" ? <GiftVerificationCardBanner {...bannerProps} /> : null,
      )}
      <GiftVerificationBottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onVerify={fundingId => router.push(`/funding/${fundingId}/verify`)}
      />
    </div>
  );
}
