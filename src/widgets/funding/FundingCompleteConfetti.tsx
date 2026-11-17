"use client";

import { motion, type Easing } from "framer-motion";
import type { FC, SVGProps } from "react";

import { cn } from "@/utils/cn";
import {
  CONFETTI_PIECES,
  type ConfettiColor,
  type ConfettiPiece,
} from "@/widgets/funding/confettiPieces";
import Confetti0 from "@/assets/images/funding-complete/confetti-0.svg?react";
import Confetti1 from "@/assets/images/funding-complete/confetti-1.svg?react";
import Confetti2 from "@/assets/images/funding-complete/confetti-2.svg?react";
import Confetti3 from "@/assets/images/funding-complete/confetti-3.svg?react";
import Confetti4 from "@/assets/images/funding-complete/confetti-4.svg?react";
import Confetti5 from "@/assets/images/funding-complete/confetti-5.svg?react";
import Confetti6 from "@/assets/images/funding-complete/confetti-6.svg?react";
import Confetti7 from "@/assets/images/funding-complete/confetti-7.svg?react";
import Confetti8 from "@/assets/images/funding-complete/confetti-8.svg?react";
import Confetti9 from "@/assets/images/funding-complete/confetti-9.svg?react";
import Confetti10 from "@/assets/images/funding-complete/confetti-10.svg?react";

// size는 조각 본체, inset은 그림자·광택이 번지는 만큼 SVG를 본체보다 키우는 값이다 (Figma 내보내기 기준)
const STAR_INSET = "inset-[-23.08%_-20.63%_-13.53%_-20.63%]";
const SVG_PIECES: { Svg: FC<SVGProps<SVGSVGElement>>; size: string; inset: string }[] = [
  { Svg: Confetti0, size: "size-3.5", inset: "inset-[-42.86%]" },
  { Svg: Confetti1, size: "size-6.5", inset: STAR_INSET },
  { Svg: Confetti2, size: "size-4.5", inset: "inset-[-33.33%]" },
  { Svg: Confetti3, size: "size-6.5", inset: STAR_INSET },
  { Svg: Confetti4, size: "size-5.5", inset: "inset-[-27.27%]" },
  { Svg: Confetti5, size: "size-6.5", inset: STAR_INSET },
  { Svg: Confetti6, size: "size-3.5", inset: "inset-[-42.86%]" },
  { Svg: Confetti7, size: "size-6.5", inset: STAR_INSET },
  { Svg: Confetti8, size: "size-4.5", inset: "inset-[-33.33%]" },
  { Svg: Confetti9, size: "size-6.5", inset: STAR_INSET },
  { Svg: Confetti10, size: "size-5.5", inset: "inset-[-27.27%]" },
];

// 노란색(#ffc342)은 tokens.css에 없어 Figma 값을 그대로 쓴다
const PILL_COLOR: Record<ConfettiColor, string> = {
  blue: "bg-base-blue-500",
  pink: "bg-base-pink-500",
  lime: "bg-base-lime-500",
  orange: "bg-base-orange-500",
  yellow: "bg-[#ffc342]",
};

const PILL_BASE =
  "opacity-75 shadow-[0_0_6px_0_rgb(255_255_255/0.7),inset_1px_1px_1.5px_0_rgb(255_255_255/0.6)]";
const PILL_VERTICAL = `${PILL_BASE} h-6.5 w-2.5 rounded-[5px] bg-[linear-gradient(111deg,rgb(255_255_255/0.75)_14.286%,rgb(255_255_255/0.15)_39.286%,rgb(255_255_255/0)_57.143%,rgb(255_255_255/0.25)_85.714%)]`;
const PILL_HORIZONTAL = `${PILL_BASE} h-2 w-5.5 rounded-[4px] bg-[linear-gradient(160deg,rgb(255_255_255/0.75)_14.286%,rgb(255_255_255/0.15)_39.286%,rgb(255_255_255/0)_57.143%,rgb(255_255_255/0.25)_85.714%)]`;

// Figma: 처음 125px은 일정하게, 이후 화면 밖(694px)까지는 점점 빨라진다
const FALL_DISTANCE = [125, 694];
const FALL_EASE: Easing[] = ["linear", [0.45, 0, 0.75, 0.5]];
const SWAY_EASE: Easing = [0.4, 0, 0.6, 1];
const FIRST_LEG_RATIO = 0.25;

function ConfettiBody({ piece }: { piece: ConfettiPiece }) {
  if ("svg" in piece) {
    const { Svg, size, inset } = SVG_PIECES[piece.svg];
    return (
      <div className={cn("relative", size)}>
        <Svg className={cn("absolute block size-auto max-w-none", inset)} />
      </div>
    );
  }
  return (
    <div className={cn(PILL_COLOR[piece.pill], piece.vertical ? PILL_VERTICAL : PILL_HORIZONTAL)} />
  );
}

export default function FundingCompleteConfetti() {
  return (
    <div aria-hidden className="pointer-events-none absolute top-0 left-1/2 w-90 -translate-x-1/2">
      {CONFETTI_PIECES.map((piece, index) => {
        const { cx, cy, deg, delay, duration, dx, spin } = piece;
        return (
          <motion.div
            key={index}
            initial={{ x: cx, y: cy, opacity: 0 }}
            animate={{ x: cx + dx, y: [cy, ...FALL_DISTANCE.map(d => cy + d)], opacity: 1 }}
            transition={{
              delay,
              duration,
              x: { delay, duration, ease: SWAY_EASE },
              y: { delay, duration, times: [0, FIRST_LEG_RATIO, 1], ease: FALL_EASE },
              // 낙하가 시작되는 순간 나타난다
              opacity: { delay, duration: 0 },
            }}
            className="absolute top-0 left-0">
            <motion.div
              initial={{ rotate: deg }}
              animate={{ rotate: deg + spin }}
              transition={{ delay, duration, ease: "linear" }}
              className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
              <ConfettiBody piece={piece} />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
