"use client";

import type { MouseEvent } from "react";

import { motion, useTransform, type MotionValue } from "framer-motion";

import type { LetterPaperProps } from "@/widgets/letter-paper/LetterPaper";
import RollingPaperLetter from "@/widgets/rolling-paper/RollingPaperLetter";
import {
  toArrivalCardTransition,
  type ArrivalCardEntrance,
} from "@/widgets/rolling-paper/rollingPaperMotion";
import {
  toCardPose,
  toTransform,
  toWheelOffset,
  type WheelPose,
} from "@/widgets/rolling-paper/wheelGeometry";

export const WHEEL_CARD_WIDTH = 250.768;
export const WHEEL_CARD_HEIGHT = 272;

type RollingPaperWheelCardProps = {
  letter: LetterPaperProps;
  index: number;
  count: number;
  progress: MotionValue<number>;
  entrance: ArrivalCardEntrance | null;
  onEntered?: () => void;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
};

// 바깥은 등장 모션, 안쪽은 휠 위치를 맡는다. 둘 다 transform을 쓰므로 요소를 나눠 서로 덮어쓰지 않게 한다
export default function RollingPaperWheelCard({
  letter,
  index,
  count,
  progress,
  entrance,
  onEntered,
  onClick,
}: RollingPaperWheelCardProps) {
  const pose = useTransform<number, WheelPose>(progress, value =>
    toCardPose(toWheelOffset(index, value, count)),
  );
  const transform = useTransform(pose, toTransform);
  const opacity = useTransform(pose, ({ opacity }) => opacity);

  return (
    <motion.div
      className="pointer-events-none absolute top-1/2 left-1/2"
      style={{
        width: WHEEL_CARD_WIDTH,
        height: WHEEL_CARD_HEIGHT,
        marginLeft: -WHEEL_CARD_WIDTH / 2,
        marginTop: -WHEEL_CARD_HEIGHT / 2,
      }}
      initial={
        entrance
          ? {
              x: entrance.x,
              y: entrance.y,
              rotate: entrance.rotate,
              scale: entrance.scale,
              opacity: 0,
            }
          : false
      }
      animate={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
      transition={entrance ? toArrivalCardTransition(entrance) : undefined}
      onAnimationComplete={onEntered}>
      <motion.div
        data-testid="wheel-card"
        className="pointer-events-auto relative size-full"
        style={{ transform, opacity }}
        onClick={onClick}>
        <RollingPaperLetter letter={letter} width={WHEEL_CARD_WIDTH} />
      </motion.div>
    </motion.div>
  );
}
