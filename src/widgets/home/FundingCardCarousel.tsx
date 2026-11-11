"use client";

import { useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { cn } from "@/utils/cn";
import FundingCard, { type FundingCardProps } from "@/widgets/home/FundingCard";
import PageIndicator from "@/widgets/home/PageIndicator";

export type FundingCardData = Omit<FundingCardProps, "className" | "animateGift"> & {
  id: string | number;
};

type FundingCardCarouselProps = {
  cards: FundingCardData[];
  animateOnMount?: boolean;
  className?: string;
};

const SWIPE_OFFSET_PX = 50;
const SWIPE_VELOCITY = 500;
const SLIDE_DISTANCE_PX = 80;

const PEEK_STYLE =
  "pointer-events-none absolute top-1/2 -translate-y-1/2 scale-[0.6991] opacity-29 blur-[8.377px]";

const NAV_BUTTON_STYLE =
  "sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-1/2 focus-visible:z-10 focus-visible:-translate-y-1/2 focus-visible:rounded-full focus-visible:bg-semantic-fill-default focus-visible:px-3 focus-visible:py-2 focus-visible:text-semantic-text-primary focus-visible:shadow-[0_4px_16px_0_var(--color-semantic-shadow-weak)] focus-visible:[font:var(--semantic-label-x-small)]";

const slideVariants = {
  enter: (direction: number) => ({ x: direction * SLIDE_DISTANCE_PX, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: -direction * SLIDE_DISTANCE_PX, opacity: 0 }),
};

export default function FundingCardCarousel({
  cards,
  animateOnMount = false,
  className,
}: FundingCardCarouselProps) {
  // 첫 진입도 다음 카드로 넘어갈 때처럼 오른쪽에서 슬라이드되도록 방향을 1로 둔다
  const [[pageIndex, direction], setPage] = useState<[number, number]>([0, animateOnMount ? 1 : 0]);
  const index = Math.min(pageIndex, cards.length - 1);
  const current = cards[index];
  const prev = cards[index - 1];
  const next = cards[index + 1];
  const isCarousel = cards.length > 1;

  if (!current) return null;

  const paginate = (step: number) => {
    const target = index + step;
    if (target < 0 || target >= cards.length) return;
    setPage([target, step]);
  };

  const handleDragEnd = (_: unknown, { offset, velocity }: PanInfo) => {
    if (offset.x < -SWIPE_OFFSET_PX || velocity.x < -SWIPE_VELOCITY) paginate(1);
    else if (offset.x > SWIPE_OFFSET_PX || velocity.x > SWIPE_VELOCITY) paginate(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    paginate(event.key === "ArrowRight" ? 1 : -1);
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="펀딩 카드"
      tabIndex={isCarousel ? 0 : undefined}
      onKeyDown={isCarousel ? handleKeyDown : undefined}
      className={cn("relative flex w-80 flex-col items-center gap-2", className)}>
      <div className="relative flex w-full">
        {prev && (
          <div aria-hidden className={cn(PEEK_STYLE, "left-[-96.86px] origin-left")}>
            <FundingCard {...prev} animateGift={false} />
          </div>
        )}
        {next && (
          <div aria-hidden className={cn(PEEK_STYLE, "right-[-96.86px] origin-right")}>
            <FundingCard {...next} animateGift={false} />
          </div>
        )}
        <AnimatePresence initial={animateOnMount} custom={direction} mode="popLayout">
          <motion.div
            key={current.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${cards.length}개 중 ${index + 1}번째`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
            drag={isCarousel ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={handleDragEnd}
            className="w-full touch-pan-y">
            <FundingCard {...current} />
          </motion.div>
        </AnimatePresence>
        {isCarousel && (
          <>
            <button
              type="button"
              onClick={() => paginate(-1)}
              aria-disabled={!prev}
              className={cn(NAV_BUTTON_STYLE, "focus-visible:left-2")}>
              이전 카드
            </button>
            <button
              type="button"
              onClick={() => paginate(1)}
              aria-disabled={!next}
              className={cn(NAV_BUTTON_STYLE, "focus-visible:right-2")}>
              다음 카드
            </button>
          </>
        )}
      </div>
      {isCarousel && <PageIndicator total={cards.length} current={index + 1} />}
    </div>
  );
}
