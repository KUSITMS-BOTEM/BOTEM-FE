import { useId } from "react";
import Image from "next/image";
import { cn } from "@/utils/cn";
import Badge from "@/components/Badge";
import FundingCardGiftCover from "@/widgets/home/FundingCardGiftCover";
import ProfileBox, { type ProfileColor } from "@/widgets/home/ProfileBox";
import ProgressBar from "@/widgets/home/ProgressBar";
import IconLock from "@/assets/icons/icon-lock.svg?react";

export type FundingCardType = "default" | "notification" | "open";

export type FundingCardProps = {
  type?: FundingCardType;
  title: string;
  productName: string;
  productImageUrl: string;
  progress: number;
  dDay: number;
  targetAmount: number;
  participants?: ProfileColor[];
  extraParticipantCount?: number;
  pendingCount?: number;
  isSurprise?: boolean;
  animateGift?: boolean;
  className?: string;
};

export default function FundingCard({
  type = "default",
  title,
  productName,
  productImageUrl,
  progress,
  dDay,
  targetAmount,
  participants = [],
  extraParticipantCount = 0,
  pendingCount = 0,
  isSurprise = false,
  animateGift = true,
  className,
}: FundingCardProps) {
  const isGiftCover = type !== "default";
  const titleId = useId();

  return (
    <article className={cn("relative flex w-80 flex-col items-center", className)}>
      <div className="absolute inset-x-[8.13%] -bottom-7 h-40.5 overflow-hidden rounded-full opacity-40 blur-[18.484px]">
        <Image src={productImageUrl} alt="" fill unoptimized className="object-cover" />
      </div>
      <div className="relative flex w-full flex-col overflow-clip rounded-3xl">
        <div className="relative flex h-63.75 w-full flex-col items-start gap-2.5 px-4 pt-5">
          <div className="absolute inset-[0_0_-12.68%_0]">
            <Image
              src={productImageUrl}
              alt={productName}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
          {isGiftCover ? (
            <FundingCardGiftCover
              type={type}
              pendingCount={pendingCount}
              productImageUrl={productImageUrl}
              animateGift={animateGift}
            />
          ) : (
            <>
              {participants.length > 0 && (
                <ProfileBox
                  profiles={participants}
                  extraCount={extraParticipantCount}
                  className="shrink-0"
                />
              )}
              {pendingCount > 0 && (
                <Badge
                  color="danger"
                  label={`확인대기 ${pendingCount}`}
                  className="absolute bottom-0 left-4"
                />
              )}
            </>
          )}
        </div>
        <div className="from-semantic-fill-default to-semantic-fill-default/60 relative flex w-full flex-col gap-4 bg-linear-to-b px-4 pt-2.5 pb-5">
          <div className={cn("flex w-full flex-col gap-1", isGiftCover && "opacity-50")}>
            <div className="flex w-full min-w-0 items-center gap-1">
              <p
                id={titleId}
                className="text-semantic-text-strong truncate [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-title-a2-z-x-small-weak)]">
                {title}
              </p>
              {isSurprise && (
                <IconLock
                  aria-label="서프라이즈 펀딩"
                  className="text-semantic-icon-secondary size-4 shrink-0"
                />
              )}
            </div>
            <p className="text-semantic-text-secondary w-full truncate [letter-spacing:var(--letter-spacing-default)] opacity-72 [font:var(--semantic-subtext-large)]">
              {productName}
            </p>
          </div>
          <div className={cn("flex w-full flex-col gap-1", isGiftCover && "opacity-50")}>
            <ProgressBar progress={progress} aria-labelledby={titleId} />
            <div className="text-semantic-text-tertiary flex w-full items-center justify-between [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-subtext-medium)]">
              <span>마감까지 D-{dDay}</span>
              <span className="flex items-center gap-0.5">
                <span>목표</span>
                <span>{targetAmount.toLocaleString("ko-KR")}원</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
