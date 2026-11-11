import Image from "next/image";
import GiftAnimation from "@/components/effects/GiftAnimation";
import type { FundingCardType } from "@/widgets/home/FundingCard";

type FundingCardGiftCoverProps = {
  type: Exclude<FundingCardType, "default">;
  pendingCount: number;
  productImageUrl: string;
  animateGift: boolean;
};

const GIFT_COVER_TEXT: Record<FundingCardGiftCoverProps["type"], (pendingCount: number) => string> =
  {
    notification: count => `확인대기 ${count}건을\n확인하고 펑 터트려봐요!`,
    open: () => "펑!\n터트려볼까요?",
  };

export default function FundingCardGiftCover({
  type,
  pendingCount,
  productImageUrl,
  animateGift,
}: FundingCardGiftCoverProps) {
  return (
    <div className="absolute inset-x-0 top-0 flex h-63.75 flex-col items-center justify-center gap-2.5 px-4 pt-5">
      <div className="bg-semantic-fill-default absolute inset-[0_0_-12.68%_0]">
        <Image
          src={productImageUrl}
          alt=""
          fill
          unoptimized
          className="object-cover opacity-30 blur-[11.71px] grayscale"
        />
      </div>
      <GiftAnimation
        variant={type === "notification" ? "wiggle" : "open"}
        playing={animateGift}
        className="relative"
      />
      <p className="text-semantic-text-strong relative text-center [letter-spacing:var(--letter-spacing-default)] whitespace-pre-line [font:var(--semantic-title-a2-z-x-small-weak)]">
        {GIFT_COVER_TEXT[type](pendingCount)}
      </p>
    </div>
  );
}
