"use client";

import { motion, useInView, useReducedMotion, type Easing } from "framer-motion";
import { useRef } from "react";

import { cn } from "@/utils/cn";
import type { Color } from "@/constants/color";
import BackShadowBlue from "@/assets/images/funding-progress-card/back-shadow-blue.svg?react";
import BackShadowGray from "@/assets/images/funding-progress-card/back-shadow-gray.svg?react";
import BackShadowLime from "@/assets/images/funding-progress-card/back-shadow-lime.svg?react";
import BackShadowOrange from "@/assets/images/funding-progress-card/back-shadow-orange.svg?react";
import BackShadowPink from "@/assets/images/funding-progress-card/back-shadow-pink.svg?react";
import GlassFill from "@/assets/images/funding-progress-card/glass-fill.svg?react";
import GlassOutline from "@/assets/images/funding-progress-card/glass-outline.svg?react";
import Wave from "@/assets/images/funding-progress-card/wave.svg?react";

export type FundingCardColor = Color | "disabled";

const BACK_SHADOW: Record<FundingCardColor, typeof BackShadowBlue> = {
  orange: BackShadowOrange,
  pink: BackShadowPink,
  lime: BackShadowLime,
  blue: BackShadowBlue,
  disabled: BackShadowGray,
};

const SINE: Easing = [0.37, 0, 0.63, 1];
const LOOP = { duration: 2, ease: SINE, repeat: Infinity };

// Figma 키프레임: 선물상자가 위로 6px 떠올랐다 내려온다
// 끝값(-0.16px)이 시작값(0)과 다른 건 Figma 값을 그대로 옮긴 것이다. 반복 경계에서 0.16px 튀지만 눈에 띄지 않아 둔다
const FLOAT_ANIMATE = { y: [0, -6, 0, -0.159904, -0.159904] };
const FLOAT_TRANSITION = { y: { ...LOOP, times: [0, 0.475, 0.95, 0.9991, 1] } };

// Figma 키프레임: 물결이 ±8px·±2° 출렁인다. x·y는 물결 자체 기울기(6.59°)만큼 돌려 둔 값
// 끝값을 시작값과 같게 둬야 반복 경계에서 뚝 끊기지 않는다
const WAVE_ANIMATE = {
  x: [-7.944, 7.944, -7.944],
  y: [-0.918, 0.918, -0.918],
  rotate: [-2, 2, -2],
};
const WAVE_TIMES = [0, 0.7125, 1];
const WAVE_TRANSITION = {
  x: { ...LOOP, times: WAVE_TIMES },
  y: { ...LOOP, times: WAVE_TIMES },
  rotate: { ...LOOP, times: WAVE_TIMES },
};

// 블렌드는 모션이 걸린 요소 자신에 둔다. 조상에 transform이 있으면 카드 배경과 섞이지 않는다
const BOX = "absolute top-[37px] left-[25px] flex size-[358.42px] items-center justify-center";
const SHAPE = "relative size-[287.114px] flex-none rotate-[-16.97deg]";

// 물결 세로 이동량(px). 10% 단위 내림이고 50%가 Figma 원래 위치(0), 100%는 상자를 꽉 채운다
function getWaveOffset(percent: number) {
  if (percent >= 100) return -180;
  return (5 - Math.max(1, Math.floor(percent / 10))) * 28;
}

type FundingProgressGraphicProps = {
  color: FundingCardColor;
  /** 확정 달성률 (0~100) */
  percent: number;
};

export default function FundingProgressGraphic({ color, percent }: FundingProgressGraphicProps) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef);
  const BackShadow = BACK_SHADOW[color];
  const isDisabled = color === "disabled";
  // 모션 감소 설정이거나 화면 밖이면 멈춘다 (무한 반복 + blur·blend 합성 비용을 아끼기 위해)
  const paused = reduceMotion || !inView;

  const float = {
    initial: { y: 0 },
    animate: paused ? undefined : FLOAT_ANIMATE,
    transition: FLOAT_TRANSITION,
  };
  const wave = {
    initial: { x: -7.944, y: -0.918, rotate: -2 },
    animate: paused ? undefined : WAVE_ANIMATE,
    transition: WAVE_TRANSITION,
  };

  return (
    <div ref={rootRef} aria-hidden className="absolute inset-0 overflow-clip rounded-4xl">
      <motion.div {...float} className={cn(BOX, "mix-blend-screen")}>
        <div className={SHAPE}>
          {isDisabled ? (
            <BackShadow className="absolute inset-0 block size-full max-w-none" />
          ) : (
            <div className="absolute inset-[-11.95%_-13.59%_-15.23%_-13.59%]">
              <BackShadow className="block size-full max-w-none" />
            </div>
          )}
        </div>
      </motion.div>
      <motion.div {...float} className={cn(BOX, color === "lime" ? "opacity-70" : "opacity-90")}>
        <div className={SHAPE}>
          {color === "lime" && (
            <GlassFill className="absolute inset-0 block size-full max-w-none" />
          )}
          <GlassOutline className="absolute inset-0 block size-full max-w-none" />
        </div>
      </motion.div>
      {!isDisabled && (
        // 마스크(선물상자 모양, 회전 포함)는 유리 상자와 같은 BOX 좌표 틀에 둬서 정확히 겹치게 한다
        <motion.div
          {...float}
          className={cn(
            BOX,
            "[mask-image:url(/funding-progress-card/wave-mask.svg)] [mask-mode:alpha] [mask-size:100%_100%] [mask-repeat:no-repeat] mix-blend-overlay",
          )}>
          <div
            style={{ top: 98.7 + getWaveOffset(percent) }}
            className="absolute left-[-68.89px] flex h-[291.912px] w-[462.203px] items-center justify-center">
            <div className="flex-none transform-[matrix(0.9913093317327207,-0.13155187134275648,0.13502782421393877,0.9908418132611143,0,0)]">
              <motion.div {...wave} className="relative h-[236.992px] w-[433.974px]">
                <Wave className="absolute inset-0 block size-full max-w-none" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
