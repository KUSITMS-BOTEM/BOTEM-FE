"use client";

import { motion, useReducedMotion, type Easing } from "framer-motion";
import { cn } from "@/utils/cn";

// Figma 모션 타임라인은 2초 루프지만 컴포넌트 설명이 "1회 재생"이라 repeat 없이 한 번만 돈다
const DURATION_S = 2;
const BACK_OUT: Easing = [0.34, 1.56, 0.64, 1];
const HALF: Easing = [0.5, 0, 0.5, 1];

type SparkleProps = {
  position: string;
  color: string;
  scaleTimes: number[];
  opacityTimes: number[];
};

const SPARKLES: SparkleProps[] = [
  {
    position: "left-[43.5px] top-[5.5px] size-[5px]",
    color: "bg-base-gray-200",
    scaleTimes: [0, 0.275, 0.365, 0.5, 1],
    opacityTimes: [0, 0.275, 0.315, 0.5, 1],
  },
  {
    position: "left-1 top-2 size-1",
    color: "bg-base-gray-400",
    scaleTimes: [0, 0.305, 0.395, 0.53, 1],
    opacityTimes: [0, 0.305, 0.345, 0.53, 1],
  },
  {
    position: "left-[46px] top-[42px] size-1",
    color: "bg-base-gray-300",
    scaleTimes: [0, 0.335, 0.425, 0.56, 1],
    opacityTimes: [0, 0.335, 0.375, 0.56, 1],
  },
];

type DepositConfirmedAnimationProps = {
  className?: string;
};

export default function DepositConfirmedAnimation({ className }: DepositConfirmedAnimationProps) {
  const reduceMotion = useReducedMotion();
  const play = <T,>(transition: T) => (reduceMotion ? { duration: 0 } : transition);

  return (
    <div aria-hidden className={cn("relative size-14 shrink-0", className)}>
      <motion.div
        className="bg-base-gray-100 absolute top-0 left-0 size-14 rounded-full"
        initial={reduceMotion ? false : { scale: 0.3, opacity: 0 }}
        animate={{ scale: [0.3, 0.3, 1, 1], opacity: [0, 0, 1, 1] }}
        transition={play({
          scale: {
            duration: DURATION_S,
            times: [0, 0.025, 0.225, 1],
            ease: ["linear", BACK_OUT, "linear"],
          },
          opacity: {
            duration: DURATION_S,
            times: [0, 0.025, 0.1, 1],
            ease: ["linear", "easeOut", "linear"],
          },
        })}
      />
      <motion.div
        className="bg-base-gray-300 absolute top-2 left-2 size-10 rounded-full"
        initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1, 1], opacity: [0, 1, 1] }}
        transition={play({
          scale: { duration: DURATION_S, times: [0, 0.175, 1], ease: [BACK_OUT, "linear"] },
          opacity: { duration: DURATION_S, times: [0, 0.05, 1], ease: ["easeOut", "linear"] },
        })}
      />
      <svg
        width="19.5"
        height="14.5"
        viewBox="0 0 19.5 14.5"
        fill="none"
        className="absolute top-[21.25px] left-[18.25px] overflow-visible">
        <motion.path
          d="M1.75 7.25L7.25 12.75L17.75 1.75"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-semantic-icon-on-fill"
          pathLength={1}
          initial={reduceMotion ? false : { strokeDasharray: "0 1", strokeDashoffset: 0 }}
          animate={{ strokeDasharray: ["0 1", "0 1", "1 1", "1 1"] }}
          transition={play({
            duration: DURATION_S,
            times: [0, 0.15, 0.325, 1],
            ease: ["linear", "easeOut", "linear"],
          })}
        />
      </svg>
      {SPARKLES.map(({ position, color, scaleTimes, opacityTimes }) => (
        <motion.div
          key={position}
          className={cn("absolute rounded-full", position, color)}
          initial={{ scale: 0, opacity: 0 }}
          animate={
            reduceMotion ? undefined : { scale: [0, 0, 1.3, 0, 0], opacity: [0, 0, 1, 0, 0] }
          }
          transition={{
            scale: {
              duration: DURATION_S,
              times: scaleTimes,
              ease: ["linear", "easeOut", "easeInOut", "linear"],
            },
            opacity: {
              duration: DURATION_S,
              times: opacityTimes,
              ease: ["linear", "easeOut", HALF, "linear"],
            },
          }}
        />
      ))}
    </div>
  );
}
