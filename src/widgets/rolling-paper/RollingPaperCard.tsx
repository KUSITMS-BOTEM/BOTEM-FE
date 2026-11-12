"use client";

import { motion } from "framer-motion";

import {
  EASE_STANDARD,
  MOTION_START_DELAY,
  STAGE_DURATION,
  STAGE_TIMES,
  toKeyframes,
  type CardPose,
} from "@/widgets/rolling-paper/rollingPaperMotion";

type RollingPaperCardProps = {
  poses: CardPose[];
};

// 편지지 디자인 확정 전까지 크기·모양만 같은 회색 임시 카드
export default function RollingPaperCard({ poses }: RollingPaperCardProps) {
  return (
    <motion.div
      className="bg-base-gray-200 border-base-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border shadow-[-2.63px_-2.63px_7.804px_0px_var(--color-semantic-shadow-strong)]"
      initial={poses[0]}
      animate={toKeyframes(poses)}
      transition={{
        duration: STAGE_DURATION * (poses.length - 1),
        times: [...STAGE_TIMES],
        ease: EASE_STANDARD,
        delay: MOTION_START_DELAY,
      }}
    />
  );
}
