"use client";

import { motion } from "framer-motion";

import { cn } from "@/utils/cn";
import {
  confettiTracks,
  type ConfettiColor,
  type ConfettiPiece,
  type ConfettiShape,
} from "@/widgets/funding/fundingResultMotion";

const COLOR: Record<ConfettiColor, string> = {
  lime: "bg-base-lime-500",
  pink: "bg-base-pink-500",
  blue: "bg-base-blue-500",
};

const SHAPE: Record<ConfettiShape, string> = {
  streamer:
    "h-[18px] w-1 rounded-[2px] bg-[linear-gradient(102.5deg,rgb(255_255_255/0.75)_14.286%,rgb(255_255_255/0.15)_39.286%,rgb(255_255_255/0)_57.143%,rgb(255_255_255/0.25)_85.714%)]",
  strip:
    "h-2.5 w-1 rounded-[2px] bg-[linear-gradient(111.8deg,rgb(255_255_255/0.75)_14.286%,rgb(255_255_255/0.15)_39.286%,rgb(255_255_255/0)_57.143%,rgb(255_255_255/0.25)_85.714%)]",
  dot: "size-1.5 rounded-full bg-[linear-gradient(135deg,rgb(255_255_255/0.75)_14.286%,rgb(255_255_255/0.15)_39.286%,rgb(255_255_255/0)_57.143%,rgb(255_255_255/0.25)_85.714%)]",
};

type FundingResultConfettiPieceProps = {
  piece: ConfettiPiece;
};

export default function FundingResultConfettiPiece({ piece }: FundingResultConfettiPieceProps) {
  const { x, y, rotate, opacity, scaleY } = confettiTracks(piece);

  // 크기 0인 바깥 틀이 회전·확대의 기준점(조각 중심)이 되고, 안쪽 조각은 그 점에 가운데 정렬된다
  return (
    <motion.div
      initial={{ x: 0, y: 0, rotate: 0, opacity: 0, scaleY: scaleY?.values[0] ?? 1 }}
      animate={{
        x: x.values,
        y: y.values,
        rotate: rotate.values,
        opacity: opacity.values,
        ...(scaleY && { scaleY: scaleY.values }),
      }}
      transition={{
        x: x.transition,
        y: y.transition,
        rotate: rotate.transition,
        opacity: opacity.transition,
        scaleY: scaleY?.transition,
      }}
      className="absolute top-[100px] left-[166.5px]">
      <div
        className={cn(
          "absolute -translate-1/2 shadow-[0_0_6px_0_rgb(255_255_255/0.7),inset_1px_1px_1.5px_0_rgb(255_255_255/0.6)]",
          COLOR[piece.color],
          SHAPE[piece.shape],
        )}
      />
    </motion.div>
  );
}
