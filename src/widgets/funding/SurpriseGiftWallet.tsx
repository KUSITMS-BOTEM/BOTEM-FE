"use client";

import { motion, useReducedMotion, type Easing } from "framer-motion";

import Coin from "@/assets/images/surprise-gift/coin.svg?react";
import WalletBody from "@/assets/images/surprise-gift/wallet-body.svg?react";

// Figma 타임라인(약 30초) 그대로 반복한다. 움직임은 앞 1.5초 안에 끝나고 나머지는 정지 구간이다
const LOOP_SECONDS = 29.97;
const SNAP: Easing = [0.1, 0.9, 0.2, 1];
const SETTLE: Easing = [0.5, 0, 0.5, 1];
// 감쇠 진동으로 지갑이 동전을 받은 뒤 출렁이다 멈춘다
const WOBBLE: Easing = t =>
  1 - Math.exp(-t * 7.1866) * (Math.cos(t * 22.3441) + 0.3216 * Math.sin(t * 22.3441));

const loop = (times: number[], ease: Easing[]) => ({
  duration: LOOP_SECONDS,
  times,
  ease,
  repeat: Infinity,
});

const COIN_SCALE_TIMES = [
  0, 0.004, 0.0067, 0.01, 0.0147, 0.018, 0.0214, 0.0334, 0.036, 0.039, 0.0434, 1,
];
const COIN_SCALE_EASE: Easing[] = [
  "linear",
  "easeOut",
  SNAP,
  "easeInOut",
  "easeInOut",
  "easeInOut",
  "linear",
  "easeIn",
  "easeOut",
  "easeInOut",
  "linear",
];

function SpeedLine({ className }: { className: string }) {
  return (
    <motion.div
      // Figma 변수 color/base/yellow/500이 tokens.css에 아직 없어 값을 그대로 쓴다
      className={`absolute top-3.5 w-[3px] rounded-[1.5px] bg-[#ffc342] ${className}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: [0, 0, 0.9, 0, 0], y: [6, 6, -14, -14] }}
      transition={{
        opacity: loop([0, 0.008, 0.01, 0.0167, 1], ["linear", "easeOut", "easeIn", "linear"]),
        y: loop([0, 0.008, 0.0167, 1], ["linear", SNAP, "linear"]),
      }}
    />
  );
}

// 목표 미달일 때 송금을 권하는 지갑 그림 (Figma: Send Money · B 계좌)
export default function SurpriseGiftWallet() {
  const reduceMotion = useReducedMotion() ?? false;

  if (reduceMotion) {
    return (
      <div aria-hidden className="relative size-40 shrink-0">
        <Coin className="absolute top-5 left-[53.33px]" />
        <WalletBody className="absolute top-[53.33px] left-5" />
      </div>
    );
  }

  return (
    <div aria-hidden className="relative size-40 shrink-0">
      <SpeedLine className="left-[63px] h-2" />
      <SpeedLine className="left-[30px] h-2.5" />
      <motion.div
        className="absolute top-5 left-[53.33px]"
        animate={{
          y: [0, 0, 4, -30, -22, -24, -24, 4, 0, 0],
          rotate: [0, 0, 12, -6, 0, 0],
          scaleX: [1, 1, 1.14, 0.82, 1.1, 0.96, 1, 1, 0.86, 1.12, 1, 1],
          scaleY: [1, 1, 0.84, 1.22, 0.9, 1.04, 1, 1, 1.18, 0.88, 1, 1],
          filter: [
            "blur(0px)",
            "blur(0px)",
            "blur(3px)",
            "blur(0px)",
            "blur(0px)",
            "blur(2.5px)",
            "blur(0px)",
            "blur(0px)",
          ],
        }}
        transition={{
          y: loop(
            [0, 0.004, 0.0067, 0.012, 0.016, 0.0194, 0.0317, 0.0367, 0.0407, 1],
            [
              "linear",
              "easeOut",
              SNAP,
              "easeInOut",
              "easeInOut",
              "linear",
              "easeIn",
              "easeOut",
              "linear",
            ],
          ),
          rotate: loop(
            [0, 0.0067, 0.012, 0.0187, 0.0234, 1],
            ["linear", SNAP, "easeInOut", "easeInOut", "linear"],
          ),
          scaleX: loop(COIN_SCALE_TIMES, COIN_SCALE_EASE),
          scaleY: loop(COIN_SCALE_TIMES, COIN_SCALE_EASE),
          filter: loop(
            [0, 0.0067, 0.009, 0.0133, 0.0334, 0.0357, 0.0387, 1],
            ["linear", "easeOut", "easeOut", SETTLE, "easeIn", "easeOut", "linear"],
          ),
        }}>
        <Coin />
      </motion.div>
      <motion.div
        className="absolute top-[53.33px] left-5"
        animate={{
          scaleX: [1, 1, 1.07, 0.97, 1, 1, 1.08, 1, 1],
          scaleY: [1, 1, 0.88, 1.05, 1, 1, 0.86, 1, 1],
        }}
        transition={loop(
          [0, 0.0033, 0.0067, 0.0107, 0.0147, 0.0367, 0.0394, 0.0484, 1],
          ["linear", "easeOut", "easeInOut", "easeInOut", SETTLE, "easeOut", WOBBLE, "linear"],
        )}>
        <WalletBody />
      </motion.div>
    </div>
  );
}
