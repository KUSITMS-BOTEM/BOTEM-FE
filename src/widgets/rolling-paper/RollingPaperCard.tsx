"use client";

import { motion } from "framer-motion";

import type { LetterPaperProps } from "@/widgets/letter-paper/LetterPaper";
import RollingPaperLetter from "@/widgets/rolling-paper/RollingPaperLetter";
import {
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
  letter: LetterPaperProps;
  exiting?: boolean;
};

// 모션 좌표는 card 크기 기준이라 바깥 틀은 그대로 두고 편지지만 틀에 맞춰 축소한다
export default function RollingPaperCard({ card, letter, exiting = false }: RollingPaperCardProps) {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ width: card.width, height: card.height }}
      initial={{ ...card.poses[0], scale: START_SCALE, opacity: START_OPACITY }}
      animate={exiting ? toExitTarget(card) : toKeyframes(card.poses)}
      transition={exiting ? toExitTransition(card.exit) : CARD_TRANSITION}>
      <RollingPaperLetter letter={letter} width={card.width} />
    </motion.div>
  );
}
