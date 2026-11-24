import { useId, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/utils/cn";
import Badge from "@/components/Badge";
import FundingCardCompleteFx from "@/widgets/home/FundingCardCompleteFx";
import FundingCardExpiredFx from "@/widgets/home/FundingCardExpiredFx";
import type { FundingCardFxPhase } from "@/widgets/home/fundingCardFxMotion";
import ProfileBox, { type ProfileBoxItem } from "@/components/ProfileBox";
import ProgressBar from "@/widgets/home/ProgressBar";
import IconLock from "@/assets/icons/icon-lock.svg?react";

export type FundingCardType = "default" | "notification" | "complete" | "earlyComplete" | "open";

const FX_LABEL: Partial<Record<FundingCardType, (pendingCount: number) => string>> = {
  notification: count => `확인 대기 ${count}건을 확인하면 열어볼 수 있어요`,
  complete: () => "다 모였어요. 팡! 열어볼까요?",
  earlyComplete: () => "마감일이 아직 안지났지만 지금 펑! 열까요?",
  open: () => "기간이 만료되었어요.",
};

export type FundingCardProps = {
  type?: FundingCardType;
  title: string;
  productName: string;
  productImageUrl: string;
  progress: number;
  dDay: number | null;
  targetAmount?: number;
  participants?: ProfileBoxItem[];
  extraParticipantCount?: number;
  pendingCount?: number;
  // 확인 대기 배지가 없을 때 같은 자리에 보이는 상태 안내 (예: 서프라이즈 "지유가 아직 못받았어요")
  statusLabel?: string;
  // 타입별 기본 칩 문구 대신 쓸 문구 (서프라이즈는 달성률·확인 대기에 따라 문구가 다르다)
  fxLabelText?: string;
  isSurprise?: boolean;
  animate?: boolean;
  fxPaused?: boolean;
  onClick?: () => void;
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
  statusLabel,
  fxLabelText,
  isSurprise = false,
  animate = true,
  fxPaused = false,
  onClick,
  className,
}: FundingCardProps) {
  const fxLabel = FX_LABEL[type] && (fxLabelText ?? FX_LABEL[type](pendingCount));
  const titleId = useId();
  const fxLabelId = useId();
  const reduceMotion = useReducedMotion();
  const [fxPhase, setFxPhase] = useState<FundingCardFxPhase>("idle");
  const fxAnimate = animate && !reduceMotion;

  const handleClick = () => {
    if (!fxLabel || !fxAnimate) return onClick?.();
    if (fxPhase !== "idle") return;
    if (type === "complete" || type === "earlyComplete") return setFxPhase("burst");
    if (type === "open") return setFxPhase("press");
    setFxPhase("press");
    onClick?.();
  };

  const card = (
    <div className="relative flex w-full flex-col overflow-clip rounded-3xl">
      <div className="relative flex h-63.75 w-full flex-col items-start gap-2.5 px-4 pt-5">
        {/* 사진이 로드되기 전이나 투명한 부분으로 카드 뒤 칩 글로우(blur)가 비치지 않게 배경을 깐다 */}
        <div className="bg-semantic-fill-default absolute inset-[0_0_-12.68%_0]">
          <Image
            src={productImageUrl}
            alt={productName}
            fill
            unoptimized
            className="object-cover"
          />
          <div
            aria-hidden
            className="to-semantic-fill-default absolute inset-0 bg-linear-to-b from-transparent from-64% to-88%"
          />
        </div>
        {/* open(참여자 0명)은 Figma상 프로필·배지 없이 만료 안내만 보인다 */}
        {type !== "open" && (participants.length > 0 || extraParticipantCount > 0) && (
          <ProfileBox
            profiles={participants}
            extraCount={extraParticipantCount}
            className="shrink-0"
          />
        )}
        {type !== "open" && pendingCount > 0 && (
          <Badge
            color="danger"
            label={`확인 대기 ${pendingCount}`}
            className="absolute bottom-0 left-4"
          />
        )}
        {type !== "open" && pendingCount === 0 && statusLabel && (
          <Badge color="danger" label={statusLabel} className="absolute bottom-0 left-4" />
        )}
      </div>
      <div className="from-semantic-fill-default to-semantic-fill-default/60 relative flex w-full flex-col gap-4 bg-linear-to-b px-4 pt-2.5 pb-5">
        <div className="flex w-full flex-col gap-1">
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
        <div className="flex w-full flex-col gap-1">
          <ProgressBar progress={progress} aria-labelledby={titleId} />
          <div className="text-semantic-text-tertiary flex w-full items-center justify-between [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-subtext-medium)]">
            <span>{dDay === null ? "마감" : `마감까지 D-${dDay}`}</span>
            {targetAmount !== undefined && (
              <span className="flex items-center gap-0.5">
                <span>목표</span>
                <span>{targetAmount.toLocaleString("ko-KR")}원</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <article className={cn("relative flex w-80 flex-col items-center", className)}>
      <div className="absolute inset-x-[8.13%] -bottom-7 h-40.5 overflow-hidden rounded-full opacity-40 blur-[18.484px]">
        <Image src={productImageUrl} alt="" fill unoptimized className="object-cover" />
      </div>
      {type === "open" && fxLabel ? (
        <FundingCardExpiredFx
          label={fxLabel}
          labelId={fxLabelId}
          phase={fxPhase === "press" ? "press" : "idle"}
          animate={fxAnimate}
          onExitEnd={() => onClick?.()}>
          {card}
        </FundingCardExpiredFx>
      ) : fxLabel ? (
        <FundingCardCompleteFx
          label={fxLabel}
          labelId={fxLabelId}
          phase={fxPhase}
          animate={fxAnimate && !(fxPaused && fxPhase === "idle")}
          onPressEnd={() => setFxPhase("idle")}
          onBurstEnd={() => onClick?.()}>
          {card}
        </FundingCardCompleteFx>
      ) : (
        card
      )}
      {onClick && (
        <button
          type="button"
          aria-labelledby={titleId}
          aria-describedby={fxLabel ? fxLabelId : undefined}
          onClick={handleClick}
          className="focus-visible:ring-semantic-border-strong absolute inset-0 cursor-pointer rounded-3xl focus-visible:ring-2 focus-visible:outline-none"
        />
      )}
    </article>
  );
}
