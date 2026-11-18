import Image from "next/image";

import Badge from "@/components/Badge";
import { cn } from "@/utils/cn";
import { formatDeadlineShort } from "@/utils/funding/formatDeadline";
import { getDDayLabel } from "@/utils/funding/getDDayLabel";
import ProfileOrange from "@/assets/icons/multicolor/profile-orange.svg?react";

type FundingShareCardSize = "medium" | "large";

type FundingShareCardProps = {
  size?: FundingShareCardSize;
  openerName: string;
  /** 줄바꿈(\n)으로 두 줄을 나눈다 */
  title: string;
  productImageUrl?: string;
  productName: string;
  targetAmount: number;
  /** "YYYY-MM-DD" */
  deadline: string;
  showBadge?: boolean;
  /** 달성률(%). 0이거나 없으면 문구를 숨긴다 */
  progress?: number;
  className?: string;
};

const ALMOST_THERE_PROGRESS = 60;

const getProgressText = (progress = 0) => {
  if (progress <= 0) return "";
  return progress > ALMOST_THERE_PROGRESS
    ? `${progress}% 달성! 아주 조금 남았어요!`
    : `${progress}% 달성!`;
};

const SIZE_STYLE: Record<
  FundingShareCardSize,
  {
    card: string;
    title: string;
    progress: string;
    imageArea: string;
    shadow: string;
    image: string;
    imageSizes: string;
    info: string;
    infoLabel: string;
    infoValue: string;
  }
> = {
  medium: {
    card: "w-60 rounded-[20px] border-[0.75px] px-4 py-5",
    title: "[font:var(--semantic-title-medium)]",
    progress: "[font:var(--semantic-label-x-small)]",
    imageArea: "py-3",
    shadow: "top-[124px] h-[78px] inset-x-[16.83%] blur-[14px]",
    image: "h-[178px] w-[208px] rounded-2xl",
    imageSizes: "208px",
    info: "gap-1",
    infoLabel: "[font:var(--semantic-subtext-small)]",
    infoValue: "[font:var(--semantic-label-x-small-weak)]",
  },
  large: {
    card: "h-[569px] w-80 justify-between rounded-[28px] border px-5 py-10",
    title: "[font:var(--semantic-display-large)]",
    progress: "[font:var(--semantic-title-x-small)]",
    imageArea: "py-4",
    shadow: "top-[170.8px] h-[104.197px] inset-x-[16.95%] blur-[18.484px]",
    image: "h-[239px] w-[280px] rounded-3xl",
    imageSizes: "280px",
    info: "h-[73px] justify-between",
    infoLabel: "[font:var(--semantic-subtext-large)]",
    infoValue: "[font:var(--semantic-label-small-weak)]",
  },
};

export default function FundingShareCard({
  size = "medium",
  openerName,
  title,
  productImageUrl,
  productName,
  targetAmount,
  deadline,
  showBadge = true,
  progress,
  className,
}: FundingShareCardProps) {
  const style = SIZE_STYLE[size];
  const progressText = getProgressText(progress);
  const dDay = showBadge ? getDDayLabel(deadline) : "";
  const infoRows = [
    { label: "어떤 선물", value: productName },
    { label: "얼마나?", value: `${targetAmount.toLocaleString("ko-KR")} 원` },
    { label: "언제까지?", value: `${formatDeadlineShort(deadline)}까지` },
  ];

  return (
    <div
      className={cn(
        "bg-base-gray-0 border-semantic-border-weak flex flex-col overflow-clip [letter-spacing:var(--letter-spacing-default)]",
        style.card,
        className,
      )}>
      <div className="flex w-full flex-col gap-1">
        <div className="flex w-full items-center justify-between">
          <div className="bg-base-gray-50 flex items-center gap-1.5 rounded-full px-2 py-1">
            <ProfileOrange aria-hidden className="size-5 shrink-0" />
            <span className="text-semantic-text-secondary [font:var(--semantic-label-x-small-weak)]">
              {openerName}가 여는
            </span>
          </div>
          {dDay && (
            <Badge
              color="brand"
              variant="weak"
              size={size === "large" ? "medium" : "small"}
              label={dDay}
            />
          )}
        </div>
        <p className={cn("text-semantic-text-strong whitespace-pre-line", style.title)}>{title}</p>
        {progressText && (
          <p className={cn("text-semantic-text-brand", style.progress)}>{progressText}</p>
        )}
      </div>
      <div className={cn("relative flex w-full flex-col items-center", style.imageArea)}>
        {productImageUrl && (
          // 그림자는 상품 이미지를 흐리게 겹친 것이라 같은 이미지를 쓴다
          <div
            aria-hidden
            className={cn("absolute overflow-clip rounded-full opacity-40", style.shadow)}>
            <Image
              src={productImageUrl}
              alt=""
              fill
              sizes={style.imageSizes}
              unoptimized
              className="object-cover"
            />
          </div>
        )}
        <div className={cn("bg-base-gray-200 relative shrink-0 overflow-clip", style.image)}>
          {productImageUrl && (
            // 상품 이미지 도메인이 제각각이라 next/image 최적화(remotePatterns)를 쓰지 않는다. 프로젝트 공통 관례
            <Image
              src={productImageUrl}
              alt=""
              fill
              sizes={style.imageSizes}
              unoptimized
              className="object-cover"
            />
          )}
        </div>
      </div>
      <dl className={cn("flex w-full flex-col", style.info)}>
        {infoRows.map(({ label, value }) => (
          <div key={label} className="flex h-[19px] items-center justify-between">
            <dt className={cn("text-semantic-text-tertiary", style.infoLabel)}>{label}</dt>
            <dd className={cn("text-semantic-text-primary", style.infoValue)}>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
