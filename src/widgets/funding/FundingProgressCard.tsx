"use client";

import { motion } from "framer-motion";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

import Badge from "@/components/Badge";
import { cn } from "@/utils/cn";
import {
  calcFundingPercent,
  getClosedLabel,
  getFundingProgressMessage,
} from "@/utils/funding/fundingProgress";
import { getFundingCardColor } from "@/utils/funding/getFundingCardColor";
import FundingProgressGraphic, {
  type FundingCardColor,
} from "@/widgets/funding/FundingProgressGraphic";
import ProductInfo from "@/widgets/funding/ProductInfo";
import FundingProgressCardSkeleton from "@/widgets/funding/skeleton/FundingProgressCardSkeleton";

type CardTheme = {
  stops: string;
  blur: string;
  shadow: string;
  glow?: string;
};

// Tailwind가 클래스를 정적으로 감지하도록 완성된 문자열로 둔다
const CARD_THEME: Record<FundingCardColor, CardTheme> = {
  orange: {
    stops:
      "[--card-1:var(--color-base-orange-500)] [--card-2:var(--color-base-orange-500)] [--card-3:var(--color-base-orange-400)]",
    blur: "bg-base-orange-200",
    shadow: "shadow-base-orange-500/20",
    glow: "bg-base-orange-300",
  },
  pink: {
    stops:
      "[--card-1:var(--color-base-pink-400)] [--card-2:var(--color-base-pink-500)] [--card-3:var(--color-base-pink-300)]",
    blur: "bg-base-pink-200",
    shadow: "shadow-base-pink-500/20",
    glow: "bg-base-pink-300",
  },
  lime: {
    stops:
      "[--card-1:var(--color-base-lime-500)] [--card-2:var(--color-base-lime-600)] [--card-3:var(--color-base-lime-300)]",
    blur: "bg-base-lime-200",
    shadow: "shadow-base-lime-500/20",
    glow: "bg-base-lime-500",
  },
  blue: {
    stops:
      "[--card-1:var(--color-base-blue-300)] [--card-2:var(--color-base-blue-400)] [--card-3:var(--color-base-blue-200)]",
    blur: "bg-base-blue-200",
    shadow: "shadow-base-blue-500/20",
    glow: "bg-base-blue-300",
  },
  disabled: {
    stops:
      "[--card-1:var(--color-base-gray-300)] [--card-2:var(--color-base-gray-400)] [--card-3:var(--color-base-gray-200)]",
    blur: "bg-base-gray-200",
    shadow: "shadow-base-gray-500/20",
  },
};

// Figma 선형 그라데이션(130.45°) 위에 가장자리가 밝아지는 흰색 방사형(20%)을 겹친다
const FILL =
  "[background-image:radial-gradient(ellipse_194px_243.1px_at_50%_50%,rgb(255_255_255/0)_0%,rgb(255_255_255/0.04)_65%,rgb(255_255_255/0.18)_100%),linear-gradient(130.45deg,rgb(255_240_235/0)_-48.2%,var(--card-1)_15.1%,var(--card-2)_77.2%,var(--card-3)_97.1%)]";

// Tailwind의 w-80(320px)과 같은 값. 확대 배율의 기준 폭이다
const CARD_DESIGN_WIDTH = 320;

// Figma: 카드가 나타난 뒤 약 1초에 1.06배로 커졌다가 1.4초쯤 원래 크기로 돌아온다
const STATUS_POP_TRANSITION = { delay: 1, duration: 0.4, ease: "easeInOut" } as const;

type FundingProgressCardProps = {
  /** 색상을 고정하는 키라서 제목처럼 바뀌는 값이 아닌 펀딩 고유 id를 넘긴다 */
  fundingId: number | string;
  productImageUrl: string;
  productName: string;
  /** "YYYY-MM-DD" */
  deadline: string;
  currentAmount: number;
  targetAmount: number;
  /** 서버가 달성률(%)을 직접 줄 때 넘긴다. 없으면 금액으로 계산한다 */
  progress?: number;
  /** true면 문구·달성률·목표 금액 묶음이 한 번 커졌다 돌아온다 (보태기 완료 페이지 연출) */
  popStatus?: boolean;
  /** 서프라이즈 펀딩이면 마감일 옆에 자물쇠를 보여준다 */
  locked?: boolean;
  /** 카드와 같은 배율로 커지는 320×401 좌표계 위에 얹는 요소 (예: 우측 상단 뱃지) */
  children?: ReactNode;
  className?: string;
};

export default function FundingProgressCard({
  fundingId,
  productImageUrl,
  productName,
  deadline,
  currentAmount,
  targetAmount,
  progress,
  popStatus = false,
  locked = false,
  children,
  className,
}: FundingProgressCardProps) {
  const color: FundingCardColor = currentAmount === 0 ? "disabled" : getFundingCardColor(fundingId);
  const theme = CARD_THEME[color];
  const percent = progress ?? calcFundingPercent(currentAmount, targetAmount);
  // 금액을 다 채운 마감이 기간 마감보다 우선한다
  const closedLabel = getClosedLabel({ currentAmount, targetAmount, deadline });

  // 카드는 320×401 기준 px로 그려져 있어, 부모 가로 실측값에 맞춰 통째로 비율 확대한다.
  // CSS만으로 길이÷길이를 하는 기법(tan(atan2()))은 브라우저마다 계산이 달라 쓰지 않는다
  const wrapperRef = useRef<HTMLDivElement>(null);
  // 실측 전(SSR·하이드레이션 전)에는 null로 두고 카드를 숨긴다. 320px 고정 폭으로 그려져 좁은 화면에서 넘치는 걸 막는다
  const [scale, setScale] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => {
      setScale(el.clientWidth > 0 ? el.clientWidth / CARD_DESIGN_WIDTH : 1);
    };
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className={cn("relative aspect-320/401 w-full", className)}>
      {scale === null && <FundingProgressCardSkeleton />}
      <section
        aria-label={`${productName} 펀딩 진행 상황`}
        data-color={color}
        style={scale === null ? { display: "none" } : { transform: `scale(${scale})` }}
        className="absolute top-0 left-0 flex h-100.25 w-80 origin-top-left flex-col items-start p-3">
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-4xl bg-white shadow-[0_15px_18.5px_0]",
            theme.shadow,
          )}
        />
        {theme.glow && (
          <div
            aria-hidden
            className={cn(
              "absolute top-84.5 left-[16.33px] h-23.5 w-70.25 rounded-[155px] opacity-41 blur-[26.2px]",
              theme.glow,
            )}
          />
        )}
        <div aria-hidden className={cn("absolute inset-0 rounded-4xl blur-[1px]", theme.blur)} />
        <div aria-hidden className={cn("absolute inset-0 rounded-4xl", FILL, theme.stops)} />
        <FundingProgressGraphic color={color} />
        <div className="text-semantic-text-on-fill relative flex min-h-0 w-full flex-1 flex-col justify-between">
          <ProductInfo
            productImageUrl={productImageUrl}
            productName={productName}
            deadline={deadline}
            locked={locked}
          />
          <motion.div
            animate={popStatus ? { scale: [1, 1.06, 1] } : undefined}
            transition={STATUS_POP_TRANSITION}
            className="flex w-full origin-bottom-left flex-col items-start gap-2 px-3 pt-1 pb-2">
            {closedLabel && <Badge label={closedLabel} />}
            <p className="px-0.5 [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-title-x-small-weak)]">
              {getFundingProgressMessage(percent)}
            </p>
            <div className="flex flex-col gap-1">
              <p
                role="progressbar"
                aria-label="펀딩 달성률"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                className="whitespace-nowrap [font:900_72px/0.79_Pretendard]">
                {percent}%
              </p>
              <p className="px-0.5 [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-subtext-large)]">
                목표가 {targetAmount.toLocaleString("ko-KR")}원
              </p>
            </div>
          </motion.div>
        </div>
        {children}
      </section>
    </div>
  );
}
