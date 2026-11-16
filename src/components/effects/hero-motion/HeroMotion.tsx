"use client";

import { motion, useReducedMotion } from "framer-motion";
import FloorShadow from "@/assets/images/hero/floor-shadow.svg?react";
import HeroConfetti from "./HeroConfetti";
import HeroMark from "./HeroMark";
import { cn } from "@/utils/cn";
import { BURST_CONFETTI, HERO_TRACKS, SNOW_CONFETTI } from "./heroMotionData";
import { toMotion } from "./heroMotionTrack";

const { floorShadow, popRing, popRing2, ball, sparkle1, sparkle2, sparkle3 } = HERO_TRACKS;
const { sx: ballSx, sy: ballSy, ...ballMove } = ball;

const SPARKLES = [
  { tracks: sparkle1, position: "top-[60px] left-[222px]" },
  { tracks: sparkle2, position: "top-[90px] left-[66px]" },
  { tracks: sparkle3, position: "top-[184px] left-[206px]" },
];

type HeroMotionProps = {
  className?: string;
};

// 마크·공·링·컨페티가 영역 정중앙에 오도록 Figma의 시각 보정(별 중심이 영역 중앙보다 8px 왼쪽, 16px 위)을 되돌려 translate-x-2·translate-y-4로 민다
export default function HeroMotion({ className }: HeroMotionProps) {
  const reduceMotion = useReducedMotion();
  // 첫 렌더에는 null이라 !reduceMotion을 쓰면 모션 감소 사용자도 애니메이션이 먼저 재생된다
  const playing = reduceMotion === false;

  return (
    // 공이 Title 바로 밑에서 떨어지기 시작하도록 위쪽만 클리핑을 푼다 (좌우·아래는 그대로 자른다)
    <div
      aria-hidden
      className={cn("relative h-77 w-80 shrink-0 [clip-path:inset(-100vh_0_0_0)]", className)}>
      {playing && (
        <div className="absolute inset-0 overflow-hidden">
          {SNOW_CONFETTI.map((particle, index) => (
            <HeroConfetti key={index} particle={particle} />
          ))}
        </div>
      )}
      <div className="absolute inset-0 translate-x-2 translate-y-4">
        {playing && (
          <>
            <motion.div
              {...toMotion(floorShadow)}
              className="absolute top-[255px] left-[110px] h-3.5 w-21 origin-center">
              <FloorShadow className="absolute -top-2 -left-2 h-7.5 w-25" />
            </motion.div>
            <motion.div
              {...toMotion(popRing)}
              className="border-base-orange-500 absolute top-[106px] left-[120px] size-16 rounded-full border-3"
            />
            <motion.div
              {...toMotion(popRing2)}
              className="border-base-orange-500 absolute top-[106px] left-[120px] size-16 rounded-full border-2"
            />
          </>
        )}
        <HeroMark playing={playing} />
        {playing && (
          <>
            {SPARKLES.map(({ tracks, position }) => (
              <motion.div
                key={position}
                {...toMotion(tracks)}
                className={cn(
                  "bg-base-orange-300 absolute size-5 origin-center [clip-path:polygon(50%_0,61.31%_38.69%,100%_50%,61.31%_61.31%,50%_100%,38.69%_61.31%,0_50%,38.69%_38.69%)]",
                  position,
                )}
              />
            ))}
            {BURST_CONFETTI.map((particle, index) => (
              <HeroConfetti key={index} particle={particle} />
            ))}
            {/* Figma 순서: 이동·회전(바깥) → 눌림(안쪽) */}
            <motion.div
              {...toMotion(ballMove)}
              className="absolute top-[214px] left-[128px] size-12 origin-center">
              <motion.div
                {...toMotion({ sx: ballSx, sy: ballSy })}
                className="bg-base-orange-500 size-full origin-center rounded-full"
              />
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
