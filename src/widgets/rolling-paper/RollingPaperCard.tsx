"use client";

import { motion } from "framer-motion";

import {
  CARD_RADIUS,
  CARD_TRANSITION,
  START_OPACITY,
  START_SCALE,
  toExitTarget,
  toExitTransition,
  toKeyframes,
  type RollingCard,
} from "@/widgets/rolling-paper/rollingPaperMotion";

type RollingPaperCardProps = {
  card: RollingCard;
  exiting?: boolean;
};

// 편지지 디자인 확정 전까지 크기·모양만 같은 회색 임시 카드
export default function RollingPaperCard({ card, exiting = false }: RollingPaperCardProps) {
  return (
    <motion.div
      className="bg-base-gray-200 border-base-gray-400 absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 border shadow-[-2.63px_-2.63px_7.804px_0px_var(--color-semantic-shadow-strong)]"
      style={{ width: card.width, height: card.height, borderRadius: CARD_RADIUS }}
      initial={{ ...card.poses[0], scale: START_SCALE, opacity: START_OPACITY }}
      animate={exiting ? toExitTarget(card) : toKeyframes(card.poses)}
      transition={exiting ? toExitTransition(card.exit) : CARD_TRANSITION}
    />
  );
}
