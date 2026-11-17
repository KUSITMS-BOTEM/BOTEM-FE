"use client";

import { motion, useReducedMotion, type Easing } from "framer-motion";
import { cn } from "@/utils/cn";
import IconWishAdd from "@/assets/icons/icon-wish-add.svg?react";
import MagnifierLens from "@/assets/icons/multicolor/magnifier-lens.svg?react";

// Figma "Wish Empty · A1"(6646:339) 키프레임을 그대로 옮긴다. 4칸을 돌고 4.0s에 처음으로
const DURATION_S = 4;
const MOVE: Easing = [0.65, 0, 0.35, 1];
const TILT: Easing = [0.45, 0, 0.55, 1];
const POP: Easing = [0.34, 1.56, 0.64, 1];

const MAGNIFIER_X = {
  keyframes: [0, 0, -76, -76, 24, 24, -26, -26, 0],
  times: [0, 0.1125, 0.25, 0.3625, 0.5, 0.6125, 0.75, 0.8625, 1],
  ease: ["linear", MOVE, "linear", MOVE, "linear", MOVE, "linear", MOVE] as Easing[],
};

const MAGNIFIER_Y = {
  keyframes: [0, 0, -46, -46, 18, 18, 0],
  times: [0, 0.1125, 0.25, 0.6125, 0.75, 0.8625, 1],
  ease: ["linear", MOVE, "linear", MOVE, "linear", MOVE] as Easing[],
};

const MAGNIFIER_ROTATE = {
  keyframes: [0, 0, -8, 0, 0, 8, 0, 0, -8, 0, 0, 8, 0],
  times: [0, 0.1125, 0.18, 0.25, 0.3625, 0.43, 0.5, 0.6125, 0.68, 0.75, 0.8625, 0.93, 1],
  ease: [
    "linear",
    TILT,
    TILT,
    "linear",
    TILT,
    TILT,
    "linear",
    TILT,
    TILT,
    "linear",
    TILT,
    TILT,
  ] as Easing[],
};

const HEART_SCALE = {
  keyframes: [1, 1, 1.2, 1, 1, 1.2, 1, 1, 1.2, 1, 1, 1.2, 1, 1],
  times: [0, 0.0125, 0.05, 0.1, 0.2625, 0.3, 0.35, 0.5125, 0.55, 0.6, 0.7625, 0.8, 0.85, 1],
  ease: [
    "linear",
    POP,
    TILT,
    "linear",
    POP,
    TILT,
    "linear",
    POP,
    TILT,
    "linear",
    POP,
    TILT,
    "linear",
  ] as Easing[],
};

// 3열 2행 상품 칸. 열마다 gray-50/100이 번갈아 오고 아래 행은 반대로 시작한다
const CELL_TONES = [
  "bg-base-gray-50",
  "bg-base-gray-100",
  "bg-base-gray-50",
  "bg-base-gray-100",
  "bg-base-gray-50",
  "bg-base-gray-100",
];

type WishSearchIllustrationProps = {
  className?: string;
};

export default function WishSearchIllustration({ className }: WishSearchIllustrationProps) {
  const reduceMotion = useReducedMotion();
  const loop = (track: { times: number[]; ease: Easing[] }) => ({
    duration: DURATION_S,
    times: track.times,
    ease: track.ease,
    repeat: Infinity,
  });

  return (
    <div aria-hidden className={cn("relative h-[157px] w-80 shrink-0 overflow-clip", className)}>
      <div className="absolute top-[26px] left-[90px] grid grid-cols-3 gap-x-2.5 gap-y-[13px]">
        {CELL_TONES.map((tone, index) => (
          <div key={index} className="flex flex-col gap-[5px]">
            <span className={cn("size-10 rounded-lg", tone)} />
            <span className={cn("h-1.5 w-[30px] rounded-[3px]", tone)} />
          </div>
        ))}
      </div>
      <motion.div
        className="absolute top-[72px] left-[166px] size-[50px]"
        animate={
          reduceMotion
            ? undefined
            : {
                x: MAGNIFIER_X.keyframes,
                y: MAGNIFIER_Y.keyframes,
                rotate: MAGNIFIER_ROTATE.keyframes,
              }
        }
        transition={{
          x: loop(MAGNIFIER_X),
          y: loop(MAGNIFIER_Y),
          rotate: loop(MAGNIFIER_ROTATE),
        }}>
        {/* 렌즈 36px에 테두리 5px이 바깥으로 2.5px 넘친 41px SVG라 그만큼 당겨 놓는다 */}
        <MagnifierLens className="absolute top-[-0.5px] left-[-0.5px]" />
        <div className="absolute top-[31.51px] left-[31.51px] flex size-[16.971px] items-center justify-center">
          <span className="bg-base-gray-400 h-[18px] w-1.5 -rotate-45 rounded-[3px]" />
        </div>
        <motion.div
          className="text-semantic-icon-tertiary absolute top-[12.5px] left-3 size-4"
          animate={reduceMotion ? undefined : { scale: HEART_SCALE.keyframes }}
          transition={loop(HEART_SCALE)}>
          <IconWishAdd />
        </motion.div>
      </motion.div>
    </div>
  );
}
