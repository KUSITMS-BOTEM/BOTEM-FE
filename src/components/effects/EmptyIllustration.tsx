"use client";

import { motion, useReducedMotion, type Easing } from "framer-motion";
import { cn } from "@/utils/cn";
import EmptyDot from "@/assets/icons/multicolor/empty-dot.svg?react";
import EmptyFloorShadow from "@/assets/icons/multicolor/empty-floor-shadow.svg?react";

const DURATION_S = 4;
const SINE: Easing = [0.37, 0, 0.63, 1];

type DotBlink = { opacity: number[]; times: number[] };

const DOTS: DotBlink[] = [
  { opacity: [0.3, 1, 0.3, 0.3, 1, 0.3, 0.3], times: [0, 0.125, 0.25, 0.5, 0.625, 0.75, 1] },
  {
    opacity: [0.3, 0.3, 1, 0.3, 0.3, 1, 0.3, 0.3],
    times: [0, 0.1, 0.225, 0.35, 0.6, 0.725, 0.85, 1],
  },
  {
    opacity: [0.3, 0.3, 1, 0.3, 0.3, 1, 0.3, 0.3],
    times: [0, 0.2, 0.325, 0.45, 0.7, 0.825, 0.95, 1],
  },
];

type EmptyIllustrationProps = {
  className?: string;
};

export default function EmptyIllustration({ className }: EmptyIllustrationProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden
      className={cn(
        "relative flex h-50 w-80 shrink-0 flex-col items-center justify-center",
        className,
      )}>
      <EmptyFloorShadow className="absolute top-[126px] left-[86px]" />
      <div className="bg-base-gray-50 relative flex size-28 items-center justify-center gap-2.5 overflow-clip rounded-full">
        {DOTS.map(({ opacity, times }, index) => (
          <motion.div
            key={index}
            className="size-2.5 shrink-0"
            initial={{ opacity: 0.3 }}
            animate={reduceMotion ? undefined : { opacity }}
            transition={{ duration: DURATION_S, times, ease: SINE, repeat: Infinity }}>
            <EmptyDot />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
