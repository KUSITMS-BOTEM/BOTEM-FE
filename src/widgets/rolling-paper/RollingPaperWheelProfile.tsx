"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

import ProfileLime from "@/assets/icons/multicolor/profile-lime.svg?react";
import ProfileOrange from "@/assets/icons/multicolor/profile-orange.svg?react";
import ProfilePink from "@/assets/icons/multicolor/profile-pink.svg?react";
import {
  ARRIVAL_PROFILE_FROM,
  ARRIVAL_PROFILE_TO,
  ARRIVAL_PROFILE_TRANSITION,
} from "@/widgets/rolling-paper/rollingPaperMotion";
import {
  toProfilePose,
  toTransform,
  toWheelOffset,
  type WheelPose,
} from "@/widgets/rolling-paper/wheelGeometry";

const PROFILE_SIZE = 50;
// 프로필 이미지 데이터가 없어 색만 돌려 쓰는 임시 아이콘
const PLACEHOLDER_PROFILES = [ProfileOrange, ProfilePink, ProfileLime];

type RollingPaperWheelProfileProps = {
  index: number;
  count: number;
  progress: MotionValue<number>;
  animated: boolean;
};

export default function RollingPaperWheelProfile({
  index,
  count,
  progress,
  animated,
}: RollingPaperWheelProfileProps) {
  const pose = useTransform<number, WheelPose>(progress, value =>
    toProfilePose(toWheelOffset(index, value, count)),
  );
  const transform = useTransform(pose, toTransform);
  const opacity = useTransform(pose, ({ opacity }) => opacity);
  const Icon = PLACEHOLDER_PROFILES[index % PLACEHOLDER_PROFILES.length];

  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      style={{ width: PROFILE_SIZE, height: PROFILE_SIZE, margin: -PROFILE_SIZE / 2 }}
      initial={animated ? ARRIVAL_PROFILE_FROM : false}
      animate={ARRIVAL_PROFILE_TO}
      transition={animated ? ARRIVAL_PROFILE_TRANSITION : undefined}>
      <motion.div data-testid="wheel-profile" className="size-full" style={{ transform, opacity }}>
        <Icon className="size-full" />
      </motion.div>
    </motion.div>
  );
}
