"use client";

import Image, { type StaticImageData } from "next/image";
import { motion } from "framer-motion";

import { cn } from "@/utils/cn";
import {
  COLOR_PHOTO_AT,
  GRAY_PHOTO_FADE,
  GRAY_PHOTO_OPACITY,
  PHOTO_ROTATE,
  PHOTO_SCALE_X,
  PHOTO_SCALE_Y,
  PHOTO_SETTLED_SCALE,
  PHOTO_Y,
  SLICE_CLIPS,
  sliceFade,
} from "@/widgets/funding/fundingResultMotion";
import GlowBack from "@/assets/images/funding-result/glow-back.svg?react";
import GlowEdge from "@/assets/images/funding-result/glow-edge.svg?react";

type PhotoLayerProps = {
  src?: string | StaticImageData;
  className?: string;
};

function PhotoLayer({ src, className }: PhotoLayerProps) {
  return (
    <div className={cn("bg-semantic-fill-neutral-weak absolute inset-0", className)}>
      {src && <Image src={src} alt="" fill sizes="180px" unoptimized className="object-cover" />}
    </div>
  );
}

type FundingResultWishPhotoProps = {
  /** URL 검증은 상위(FundingResultView)에서 끝낸 값이다 */
  productImage?: string | StaticImageData;
  /** 보탠 친구 수만큼 나눈 조각 수(최대 8) */
  sliceCount: number;
  reduceMotion: boolean;
};

export default function FundingResultWishPhoto({
  productImage: src,
  sliceCount,
  reduceMotion,
}: FundingResultWishPhotoProps) {
  return (
    <motion.div
      aria-hidden
      initial={reduceMotion ? false : { scaleX: 0, scaleY: 0 }}
      animate={
        reduceMotion
          ? { scaleX: PHOTO_SETTLED_SCALE, scaleY: PHOTO_SETTLED_SCALE }
          : {
              scaleX: PHOTO_SCALE_X.values,
              scaleY: PHOTO_SCALE_Y.values,
              y: PHOTO_Y.values,
              rotate: PHOTO_ROTATE.values,
            }
      }
      transition={{
        scaleX: PHOTO_SCALE_X.transition,
        scaleY: PHOTO_SCALE_Y.transition,
        y: PHOTO_Y.transition,
        rotate: PHOTO_ROTATE.transition,
      }}
      className="absolute top-2.5 left-[76.5px] size-45">
      <div className="absolute -inset-2">
        <GlowBack className="absolute inset-[-12.24%] block size-auto max-w-none" />
      </div>
      <div className="absolute inset-0 overflow-hidden rounded-full">
        {!reduceMotion && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: GRAY_PHOTO_OPACITY }}
              transition={GRAY_PHOTO_FADE}
              className="absolute inset-0">
              <PhotoLayer src={src} className="grayscale" />
            </motion.div>
            {(SLICE_CLIPS[sliceCount] ?? []).map((clip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={sliceFade(index)}
                className={cn("absolute inset-0", clip)}>
                <PhotoLayer src={src} />
              </motion.div>
            ))}
          </>
        )}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: COLOR_PHOTO_AT, duration: 0 }}
          className="absolute inset-0">
          <PhotoLayer src={src} />
        </motion.div>
      </div>
      <div className="absolute -inset-2">
        <GlowEdge className="absolute inset-[-10.2%] block size-auto max-w-none" />
      </div>
    </motion.div>
  );
}
