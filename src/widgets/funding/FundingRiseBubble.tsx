"use client";

import { motion, type Easing } from "framer-motion";

const EASE: Easing = [0.87, 0, 0.13, 1];

type FundingRiseBubbleProps = {
  risePercent: number;
};

export default function FundingRiseBubble({ risePercent }: FundingRiseBubbleProps) {
  return (
    <div className="absolute top-[20.3px] right-[56.4px] translate-x-1/2 -translate-y-1/2 rotate-15">
      <motion.div
        initial={{ opacity: 0, scaleX: 0.2, scaleY: 0.2, rotate: -18 }}
        animate={{
          opacity: 1,
          scaleX: [0.2, 1.25, 0.9, 1],
          scaleY: [0.2, 0.85, 1.12, 1],
          rotate: [-18, 6, 0],
        }}
        exit={{ opacity: 0, transition: { duration: 0.25, ease: EASE } }}
        transition={{
          delay: 0.976,
          opacity: { delay: 0.976, duration: 0.164, ease: "linear" },
          scaleX: {
            delay: 0.976,
            duration: 0.494,
            times: [0, 0.502, 0.747, 1],
            ease: EASE,
          },
          scaleY: {
            delay: 0.976,
            duration: 0.494,
            times: [0, 0.502, 0.747, 1],
            ease: EASE,
          },
          rotate: {
            delay: 0.976,
            duration: 0.494,
            times: [0, 0.502, 1],
            ease: EASE,
          },
        }}
        className="bg-semantic-fill-neutral text-semantic-text-on-fill flex items-center gap-1 rounded-full px-5 py-2.5 [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap drop-shadow-[0_8px_10px_rgb(0_0_0/0.22)]">
        <span className="[font:var(--semantic-title-x-small)]">+{risePercent}%</span>
        <span className="[font:var(--semantic-label-small)]">올랐어요</span>
      </motion.div>
    </div>
  );
}
