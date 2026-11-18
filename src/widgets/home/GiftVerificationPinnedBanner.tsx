"use client";

import { motion, MotionConfig } from "framer-motion";

import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import GiftVerificationCount from "@/widgets/home/GiftVerificationCount";
import { PINNED_BANNER_MOTION } from "@/widgets/home/giftVerificationBannerMotion";
import IconClose from "@/assets/icons/icon-close.svg?react";
import IconNotification from "@/assets/icons/multicolor/icon-notification.svg?react";

type GiftVerificationPinnedBannerProps = {
  count: number;
  onVerify: () => void;
  onClose: () => void;
};

export default function GiftVerificationPinnedBanner({
  count,
  onVerify,
  onClose,
}: GiftVerificationPinnedBannerProps) {
  const { sheet, dot, bell, glow } = PINNED_BANNER_MOTION;

  return (
    <MotionConfig reducedMotion="user">
      <motion.section
        aria-label="선물 인증 안내"
        className="from-semantic-background-lower via-semantic-background-lower/80 to-semantic-background-lower/0 absolute -inset-x-5 top-0 z-10 flex flex-col items-center bg-linear-to-b from-25% via-[83.5%] px-5 pt-2 pb-6"
        initial={sheet.initial}
        animate={sheet.animate}
        transition={sheet.transition}>
        <div className="flex w-full justify-end">
          <IconButton
            size="medium"
            icon={<IconClose />}
            aria-label="선물 인증 안내 닫기"
            onClick={onClose}
            className="size-5"
          />
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <div aria-hidden className="relative size-12">
              <motion.span
                className="bg-semantic-fill-brand-weak absolute top-0 left-0.5 size-11 rounded-full"
                initial={glow.initial}
                animate={glow.animate}
                transition={glow.transition}
              />
              <motion.div
                className="absolute -top-9 left-0 h-21 w-12"
                initial={bell.initial}
                animate={bell.animate}
                transition={bell.transition}>
                <IconNotification className="absolute top-9 left-0 size-12" />
                <motion.span
                  className="bg-semantic-fill-blue border-semantic-border-inverted absolute top-[39px] left-7 size-[15px] rounded-full border-2"
                  initial={dot.initial}
                  animate={dot.animate}
                  transition={dot.transition}
                />
              </motion.div>
            </div>
            <GiftVerificationCount count={count} />
          </div>
          <Button color="brand" size="medium" onClick={onVerify} className="w-[98px]">
            인증하기
          </Button>
        </div>
      </motion.section>
    </MotionConfig>
  );
}
