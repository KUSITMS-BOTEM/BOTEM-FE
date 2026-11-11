"use client";

import { motion, useReducedMotion } from "framer-motion";

const ITEM_COUNT_PER_SET = 6;
const ITEM_SIZE_PX = 142.18;
const ITEM_GAP_PX = 8;
const SPEED_PX_PER_SECOND = 30;
const LOOP_DURATION_SECONDS =
  (ITEM_COUNT_PER_SET * (ITEM_SIZE_PX + ITEM_GAP_PX)) / SPEED_PX_PER_SECOND;

type PlaceholderMarqueeRowProps = {
  direction: "left" | "right";
};

export default function PlaceholderMarqueeRow({ direction }: PlaceholderMarqueeRowProps) {
  const reduceMotion = useReducedMotion();
  const keyframes = direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"];

  return (
    <motion.div
      className="flex w-max"
      initial={{ x: keyframes[0] }}
      animate={reduceMotion ? undefined : { x: keyframes }}
      transition={{ duration: LOOP_DURATION_SECONDS, ease: "linear", repeat: Infinity }}>
      {Array.from({ length: ITEM_COUNT_PER_SET * 2 }, (_, index) => (
        <div key={index} className="bg-base-gray-100 mr-2 size-[142.18px] shrink-0 rounded-3xl" />
      ))}
    </motion.div>
  );
}
