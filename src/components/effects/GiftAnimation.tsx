"use client";

import { motion, useReducedMotion, type Easing, type Transition } from "framer-motion";
import { cn } from "@/utils/cn";
import GiftBow from "@/assets/icons/multicolor/gift-bow.svg?react";

const SINE: Easing = [0.37, 0, 0.63, 1];
const POP: Easing = [0.2, 0.6, 0.35, 1];
const DROP: Easing = [0.55, 0, 0.8, 0.45];
const HALF: Easing = [0.5, 0, 0.5, 1];

const cycle = (times: number[], ease: Easing | Easing[]): Transition => ({
  duration: 2,
  times,
  ease,
  repeat: Infinity,
});

type MotionPreset = {
  initial: Record<string, number>;
  animate: Record<string, number[]>;
  transition: Record<string, Transition>;
};

const SQUASH_TIMES = [0, 0.025, 0.125, 0.21, 0.26, 0.33, 0.425, 0.55, 0.675, 1];
const SQUASH_EASE: Easing[] = ["linear", SINE, POP, SINE, DROP, SINE, SINE, SINE, "linear"];
const SWAY_TIMES = [0, 0.15, 0.24, 0.4, 0.55, 0.7, 1];
const SWAY_EASE: Easing[] = ["linear", SINE, SINE, SINE, SINE, "linear"];
const BOW_EASE: Easing[] = ["linear", SINE, SINE, SINE, SINE, "linear"];

const WIGGLE_SHADOW: MotionPreset = {
  initial: { scaleX: 1, opacity: 1 },
  animate: { scaleX: [1, 1, 1.06, 0.8, 0.82, 1.08, 0.99, 1, 1], opacity: [1, 1, 0.55, 0.6, 1, 1] },
  transition: {
    scaleX: cycle(
      [0, 0.025, 0.125, 0.21, 0.26, 0.33, 0.425, 0.55, 1],
      ["linear", SINE, POP, SINE, DROP, SINE, SINE, "linear"],
    ),
    opacity: cycle([0, 0.125, 0.21, 0.26, 0.33, 1], ["linear", POP, SINE, DROP, "linear"]),
  },
};

const WIGGLE_GIFT: MotionPreset = {
  initial: { rotate: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 },
  animate: {
    rotate: [0, 0, 3, -2.4, 1.1, 0, 0],
    scaleX: [1, 1, 1.0315, 0.979, 0.986, 1.021, 0.9916, 1.0028, 1, 1],
    scaleY: [1, 1, 0.955, 1.03, 1.02, 0.97, 1.012, 0.996, 1, 1],
    x: [0, 0, 3.244829, -2.596291, 1.190241, 0, 0],
    y: [0, 0, 2.3715, -7.781, -6.634, 1.581, -0.6324, 0.2108, 0, 0],
  },
  transition: {
    rotate: cycle(SWAY_TIMES, SWAY_EASE),
    scaleX: cycle(SQUASH_TIMES, SQUASH_EASE),
    scaleY: cycle(SQUASH_TIMES, SQUASH_EASE),
    x: cycle(SWAY_TIMES, SWAY_EASE),
    y: cycle(SQUASH_TIMES, SQUASH_EASE),
  },
};

const WIGGLE_BOW: MotionPreset = {
  initial: { scaleX: 1, scaleY: 1, y: 0 },
  animate: {
    scaleX: [1, 1, 0.97, 1.05, 0.98, 1, 1],
    scaleY: [1, 1, 0.97, 1.05, 0.98, 1, 1],
    y: [0, 0, 1, -1.666667, 0.5, 0, 0],
  },
  transition: {
    scaleX: cycle([0, 0.125, 0.21, 0.29, 0.39, 0.5, 1], BOW_EASE),
    scaleY: cycle([0, 0.125, 0.21, 0.29, 0.39, 0.5, 1], BOW_EASE),
    y: cycle([0, 0.125, 0.2, 0.275, 0.375, 0.5, 1], BOW_EASE),
  },
};

const OPEN_BOX_TIMES = [0, 0.14, 0.16, 0.19, 0.25, 0.27, 0.3, 0.39, 0.41, 0.45, 0.48, 1];
const OPEN_BOX_EASE: Easing[] = [
  "linear",
  "easeOut",
  HALF,
  HALF,
  "easeOut",
  HALF,
  HALF,
  "easeOut",
  HALF,
  HALF,
  "linear",
];

const OPEN_BOX: MotionPreset = {
  initial: { scaleX: 1, scaleY: 1 },
  animate: {
    scaleX: [1, 1, 1.05, 1, 1, 1.06, 1, 1, 1.07, 0.98, 1, 1],
    scaleY: [1, 1, 0.92, 1, 1, 0.9, 1, 1, 0.88, 1.03, 1, 1],
  },
  transition: {
    scaleX: cycle(OPEN_BOX_TIMES, OPEN_BOX_EASE),
    scaleY: cycle(OPEN_BOX_TIMES, OPEN_BOX_EASE),
  },
};

const OPEN_LID: MotionPreset = {
  initial: { rotate: 0, y: 0 },
  animate: {
    rotate: [0, 0, 7, 0, -9, 0, 12, -2, 0, 0],
    y: [0, 0, -10.333333, 0, -15.5, 0, -23.25, 0, -3.875, 0, 0],
  },
  transition: {
    rotate: cycle(
      [0, 0.05, 0.1, 0.15, 0.21, 0.26, 0.33, 0.4, 0.46, 1],
      ["linear", HALF, HALF, HALF, HALF, HALF, HALF, HALF, "linear"],
    ),
    y: cycle(
      [0, 0.05, 0.1, 0.15, 0.21, 0.26, 0.33, 0.4, 0.43, 0.46, 1],
      [
        "linear",
        "easeOut",
        "easeIn",
        "easeOut",
        "easeIn",
        "easeOut",
        "easeIn",
        "easeOut",
        "easeIn",
        "linear",
      ],
    ),
  },
};

type ConfettiParticle = {
  shape: "circle" | "square";
  color: string;
  position: string;
  start: number;
  peak: number;
  end: number;
  peakX: number;
  peakY: number;
  rotate?: [number, number];
};

const CONFETTI: ConfettiParticle[] = [
  {
    shape: "circle",
    color: "bg-base-orange-500",
    position: "left-[62.84px] top-[59.75px] size-[4.831px]",
    start: 0.32,
    peak: 0.4232,
    end: 0.7277,
    peakX: -57.822033,
    peakY: -7.06728,
  },
  {
    shape: "square",
    color: "bg-base-blue-500",
    position: "left-[56.89px] top-[59.24px] size-[5.853px]",
    start: 0.3027,
    peak: 0.4056,
    end: 0.6718,
    peakX: -52.931026,
    peakY: -32.498817,
    rotate: [-0.354622, -4.645436],
  },
  {
    shape: "circle",
    color: "bg-base-lime-500",
    position: "left-[62.35px] top-[59.45px] size-[5.439px]",
    start: 0.3192,
    peak: 0.4202,
    end: 0.6521,
    peakX: -51.094479,
    peakY: -36.793327,
  },
  {
    shape: "square",
    color: "bg-base-orange-500",
    position: "left-[57.89px] top-[59.42px] size-[5.487px]",
    start: 0.3189,
    peak: 0.4235,
    end: 0.6785,
    peakX: -39.679287,
    peakY: -49.680359,
    rotate: [-0.293683, -5.473782],
  },
  {
    shape: "circle",
    color: "bg-base-blue-500",
    position: "left-[59.62px] top-[59.66px] size-[5.013px]",
    start: 0.3186,
    peak: 0.4264,
    end: 0.6707,
    peakX: -21.091787,
    peakY: -64.526634,
  },
  {
    shape: "square",
    color: "bg-base-lime-500",
    position: "left-[61.44px] top-[58.69px] size-[6.957px]",
    start: 0.3107,
    peak: 0.4263,
    end: 0.7467,
    peakX: -1.963098,
    peakY: -54.891754,
    rotate: [-0.544868, -6.029773],
  },
  {
    shape: "circle",
    color: "bg-base-orange-500",
    position: "left-[64.4px] top-[59.05px] size-[6.225px]",
    start: 0.3211,
    peak: 0.4337,
    end: 0.7367,
    peakX: 3.992419,
    peakY: -51.576176,
  },
  {
    shape: "square",
    color: "bg-base-blue-500",
    position: "left-[52.34px] top-[59.08px] size-[6.172px]",
    start: 0.3171,
    peak: 0.4412,
    end: 0.7116,
    peakX: 30.602917,
    peakY: -55.676811,
    rotate: [-0.728616, -4.082769],
  },
  {
    shape: "circle",
    color: "bg-base-lime-500",
    position: "left-[58.85px] top-[59.26px] size-[5.814px]",
    start: 0.3058,
    peak: 0.4183,
    end: 0.6812,
    peakX: 32.122532,
    peakY: -50.287254,
  },
  {
    shape: "square",
    color: "bg-base-orange-500",
    position: "left-[60.61px] top-[58.81px] size-[6.712px]",
    start: 0.3136,
    peak: 0.4172,
    end: 0.6962,
    peakX: 38.926144,
    peakY: -37.815369,
    rotate: [-0.50786, -5.9055],
  },
  {
    shape: "circle",
    color: "bg-base-blue-500",
    position: "left-[67.71px] top-[59.18px] size-[5.976px]",
    start: 0.3204,
    peak: 0.4337,
    end: 0.725,
    peakX: 55.798901,
    peakY: -27.334814,
  },
  {
    shape: "square",
    color: "bg-base-lime-500",
    position: "left-[53.33px] top-[58.66px] size-[7.018px]",
    start: 0.3123,
    peak: 0.418,
    end: 0.7197,
    peakX: 63.489147,
    peakY: -14.700953,
    rotate: [-0.141381, 4.557684],
  },
];

// Figma 키프레임에서 모든 조각이 착지 지점 = (정점 x × 1.2, 정점 y + 23.25)를 따른다
const confettiPreset = ({
  start,
  peak,
  end,
  peakX,
  peakY,
  rotate,
}: ConfettiParticle): MotionPreset => {
  const scale = [0.3, 0.3, 1.2, 0.8, 0.8];
  const scaleTransition = cycle(
    [0, start, start + 0.05, end, 1],
    ["linear", "easeOut", HALF, "linear"],
  );
  const moveTimes = [0, start, peak, end, 1];
  const rotateFrom = (rotate?.[0] ?? 0) * (180 / Math.PI);
  const rotateTo = (rotate?.[1] ?? 0) * (180 / Math.PI);

  return {
    initial: { scale: 0.3, x: 0, y: 0, rotate: rotateFrom, opacity: 0 },
    animate: {
      scale,
      x: [0, 0, peakX, peakX * 1.2, peakX * 1.2],
      y: [0, 0, peakY, peakY + 23.25, peakY + 23.25],
      opacity: [0, 0, 1, 1, 0, 0],
      ...(rotate && { rotate: [rotateFrom, rotateFrom, rotateTo, rotateTo] }),
    },
    transition: {
      scale: scaleTransition,
      x: cycle(moveTimes, ["linear", "easeOut", "easeInOut", "linear"]),
      y: cycle(moveTimes, ["linear", "easeOut", "easeIn", "linear"]),
      opacity: cycle(
        [0, start, start + 0.015, end - 0.075, end, 1],
        [HALF, "easeOut", HALF, HALF, "linear"],
      ),
      ...(rotate && { rotate: cycle([0, start, end, 1], "linear") }),
    },
  };
};

export type GiftAnimationVariant = "wiggle" | "open";

type GiftAnimationProps = {
  variant: GiftAnimationVariant;
  /** false면 애니메이션 없이 정지 상태로 그린다 */
  playing?: boolean;
  className?: string;
};

export default function GiftAnimation({ variant, playing = true, className }: GiftAnimationProps) {
  const reduceMotion = useReducedMotion();
  const isWiggle = variant === "wiggle";

  // 정지 요청이거나 모션 감소 설정이면 initial(정지 상태)만 적용한다
  const shouldAnimate = playing && !reduceMotion;
  const play = (preset: MotionPreset | null) =>
    preset
      ? {
          initial: preset.initial,
          animate: shouldAnimate ? preset.animate : undefined,
          transition: preset.transition,
        }
      : {};

  return (
    <div aria-hidden className={cn("relative size-31 shrink-0", className)}>
      {isWiggle && (
        <motion.div
          {...play(WIGGLE_SHADOW)}
          className="bg-base-gray-100 absolute top-[111.69px] left-[19.22px] h-[5.13px] w-[85.56px] origin-center rounded-full"
        />
      )}
      <motion.div
        {...play(isWiggle ? WIGGLE_GIFT : null)}
        className="absolute inset-0 origin-center">
        <motion.div
          {...play(isWiggle ? null : OPEN_BOX)}
          className="absolute top-14.25 left-[15.5px] h-14.25 w-23.25 origin-center">
          <div className="bg-base-orange-500 absolute inset-0 rounded-t-[6px] rounded-b-[18px]" />
          <div className="bg-base-blue-500 absolute inset-y-0 left-9.25 w-4.75" />
          <div className="from-base-orange-900/35 absolute top-0 left-1/2 h-3.5 w-23 -translate-x-1/2 rounded-t-[6px] bg-linear-to-b to-transparent opacity-50" />
        </motion.div>
        <motion.div
          {...play(isWiggle ? null : OPEN_LID)}
          className="absolute top-1 left-1.5 h-13.5 w-28 origin-center">
          <motion.div
            {...play(isWiggle ? WIGGLE_BOW : null)}
            className="absolute top-0 left-0 h-12.5 w-28 origin-center">
            <GiftBow className="size-full" />
          </motion.div>
          <div className="bg-base-orange-500 absolute top-6.25 left-0 h-[28.5px] w-28 rounded-[9px]" />
          <div className="bg-base-blue-500 absolute top-6.25 left-[46.5px] h-[28.5px] w-4.75" />
        </motion.div>
      </motion.div>
      {!isWiggle &&
        CONFETTI.map((particle, index) => (
          <motion.div
            key={index}
            {...play(confettiPreset(particle))}
            className={cn(
              "absolute",
              particle.position,
              particle.color,
              particle.shape === "circle" ? "rounded-full" : "rounded-[1.033px]",
              "origin-center",
            )}
          />
        ))}
    </div>
  );
}
