"use client";

import { motion } from "framer-motion";

import {
  EXIT_COVER_END,
  EXIT_COVER_START,
  EXIT_COVER_TRANSITION,
} from "@/widgets/rolling-paper/rollingPaperMotion";

type RollingPaperOpenOverlayProps = {
  onCovered: () => void;
};

// 시트 헤더(공유·닫기)까지 회색으로 덮고, 다 덮이면 onCovered로 알린다
export default function RollingPaperOpenOverlay({ onCovered }: RollingPaperOpenOverlayProps) {
  return (
    <motion.div
      className="bg-base-gray-100 absolute inset-0"
      initial={EXIT_COVER_START}
      animate={EXIT_COVER_END}
      transition={EXIT_COVER_TRANSITION}
      onAnimationComplete={onCovered}
    />
  );
}
