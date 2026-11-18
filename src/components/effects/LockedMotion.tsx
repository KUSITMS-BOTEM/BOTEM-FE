"use client";

import { motion, useReducedMotion } from "framer-motion";
import FloorShadow from "@/assets/images/hero/floor-shadow.svg?react";
import IconLock from "@/assets/icons/icon-lock.svg?react";
import { cn } from "@/utils/cn";

const DURATION = 6;
const SOFT_EASE = [0.37, 0, 0.63, 1] as const;
const LOOP = { duration: DURATION, repeat: Infinity };
// 조각이 영역 아래(383px)로 나가면 위(-20px)에서 다시 떨어진다. 한 바퀴 이동 거리는 403px
const BOTTOM = 383;
const WRAP_DISTANCE = 403;
const WRAP_GAP = 0.0001;

type Piece = {
  color: "orange" | "lime" | "pink" | "blue";
  shape: "bar" | "dot";
  left: number;
  top: number;
  /** 회전 방향. 1이면 시계, -1이면 반시계 */
  spin: 1 | -1;
};

const PIECES: Piece[] = [
  { color: "orange", shape: "bar", left: 24, top: -20, spin: 1 },
  { color: "lime", shape: "bar", left: 58, top: 129.11, spin: -1 },
  { color: "pink", shape: "dot", left: 92, top: 278.22, spin: 1 },
  { color: "blue", shape: "bar", left: 126, top: 24.33, spin: -1 },
  { color: "orange", shape: "bar", left: 160, top: 173.44, spin: 1 },
  { color: "lime", shape: "dot", left: 194, top: 322.55, spin: -1 },
  { color: "pink", shape: "bar", left: 228, top: 68.66, spin: 1 },
  { color: "blue", shape: "bar", left: 262, top: 217.77, spin: -1 },
  { color: "orange", shape: "dot", left: 296, top: 366.88, spin: 1 },
  { color: "lime", shape: "bar", left: 40, top: 112.99, spin: -1 },
  { color: "pink", shape: "bar", left: 110, top: 262.1, spin: 1 },
  { color: "blue", shape: "dot", left: 180, top: 8.21, spin: -1 },
  { color: "orange", shape: "bar", left: 250, top: 157.32, spin: 1 },
  { color: "lime", shape: "bar", left: 286, top: 306.43, spin: -1 },
  { color: "pink", shape: "dot", left: 74, top: 52.54, spin: 1 },
  { color: "blue", shape: "bar", left: 212, top: 201.65, spin: -1 },
];

const COLOR = {
  orange: "bg-base-orange-200",
  lime: "bg-base-lime-200",
  pink: "bg-base-pink-200",
  blue: "bg-base-blue-200",
};

const SHAPE = {
  bar: "h-2.5 w-[5px] rounded-xs",
  dot: "size-1.5 rounded-full",
};

// 아래로 떨어지다 영역을 벗어나는 시점(wrapAt)에 위로 순간 이동한 뒤 제자리로 돌아오는 y 트랙
function fallTrack(top: number) {
  const toBottom = BOTTOM - top;
  const wrapAt = toBottom / WRAP_DISTANCE;
  if (wrapAt >= 1) return { y: [0, WRAP_DISTANCE], times: [0, 1] };
  return {
    y: [0, toBottom, toBottom, toBottom - WRAP_DISTANCE, 0],
    times: [0, wrapAt, wrapAt + WRAP_GAP, wrapAt + WRAP_GAP * 2, 1],
  };
}

type LockedMotionProps = {
  className?: string;
};

export default function LockedMotion({ className }: LockedMotionProps) {
  const reduceMotion = useReducedMotion();
  // 첫 렌더에는 null이라 !reduceMotion을 쓰면 모션 감소 사용자도 애니메이션이 먼저 재생된다
  const playing = reduceMotion === false;
  const pulse = { ...LOOP, times: [0, 0.25, 0.5, 0.75, 1], ease: SOFT_EASE };

  return (
    <div aria-hidden className={cn("relative h-[363px] w-80 shrink-0 overflow-hidden", className)}>
      {PIECES.map(({ color, shape, left, top, spin }) => {
        const { y, times } = fallTrack(top);
        return (
          <motion.div
            key={`${left}-${top}`}
            style={{ left, top }}
            className={cn("absolute origin-center", COLOR[color], SHAPE[shape])}
            {...(playing && {
              animate: { rotate: [0, spin * 360], y },
              transition: {
                rotate: { ...LOOP, ease: "linear" },
                y: { ...LOOP, times, ease: "linear" },
              },
            })}
          />
        );
      })}
      <motion.div
        className="absolute top-[226px] left-[104px] h-[30px] w-28 origin-center"
        {...(playing && {
          animate: { opacity: [1, 0.7, 1, 0.7, 1], scaleX: [1, 0.9, 1, 0.9, 1] },
          transition: pulse,
        })}>
        <FloorShadow className="absolute inset-[-60%_-16.07%] size-auto" />
      </motion.div>
      <motion.div
        className="from-semantic-fill-neutral-weak via-semantic-fill-neutral-weak to-semantic-background-default absolute top-[116px] left-[104px] flex size-28 items-center justify-center rounded-full bg-linear-to-b via-[51%] to-[131.7%]"
        {...(playing && { animate: { y: [0, -4, 0, -4, 0] }, transition: pulse })}>
        <motion.div
          className="size-10 origin-center"
          {...(playing && {
            animate: {
              opacity: [1, 0.4, 1, 0.4, 1, 0.4, 1],
              scale: [1, 0.94, 1, 0.94, 1, 0.94, 1],
            },
            transition: {
              ...LOOP,
              times: [0, 0.1667, 0.3333, 0.5, 0.6667, 0.8333, 1],
              ease: SOFT_EASE,
            },
          })}>
          <IconLock className="[&_path]:fill-semantic-icon-tertiary size-full" />
        </motion.div>
      </motion.div>
    </div>
  );
}
