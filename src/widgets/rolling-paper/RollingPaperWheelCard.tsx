"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

import {
  CARD_RADIUS,
  toArrivalCardTransition,
  type ArrivalCardEntrance,
} from "@/widgets/rolling-paper/rollingPaperMotion";
import {
  toCardPose,
  toTransform,
  wrapOffset,
  type WheelPose,
} from "@/widgets/rolling-paper/wheelGeometry";

// 편지지 디자인 확정 전까지 크기·모양만 같은 회색 임시 카드
export const WHEEL_CARD_WIDTH = 250.768;
export const WHEEL_CARD_HEIGHT = 272;

type RollingPaperWheelCardProps = {
  index: number;
  progress: MotionValue<number>;
  entrance: ArrivalCardEntrance | null;
  onEntered?: () => void;
};

// 바깥은 등장 모션, 안쪽은 휠 위치를 맡는다. 둘 다 transform을 쓰므로 요소를 나눠 서로 덮어쓰지 않게 한다
export default function RollingPaperWheelCard({
  index,
  progress,
  entrance,
  onEntered,
}: RollingPaperWheelCardProps) {
  const pose = useTransform<number, WheelPose>(progress, value =>
    toCardPose(wrapOffset(index, value)),
  );
  const transform = useTransform(pose, toTransform);
  const opacity = useTransform(pose, ({ opacity }) => opacity);

  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
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
        className="bg-base-gray-200 border-base-gray-400 size-full border shadow-[-2.63px_-2.63px_7.804px_0px_var(--color-semantic-shadow-strong)]"
        style={{ borderRadius: CARD_RADIUS, transform, opacity }}
      />
    </motion.div>
  );
}
