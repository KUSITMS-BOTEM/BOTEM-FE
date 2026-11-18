"use client";

import { motion, MotionConfig } from "framer-motion";

import IconButton from "@/components/IconButton";
import GiftVerificationCount from "@/widgets/home/GiftVerificationCount";
import { CARD_BANNER_MOTION } from "@/widgets/home/giftVerificationBannerMotion";
import IconClose from "@/assets/icons/icon-close.svg?react";
import IconRight from "@/assets/icons/icon-right.svg?react";

type GiftVerificationCardBannerProps = {
  count: number;
  onVerify: () => void;
  onClose: () => void;
};

export default function GiftVerificationCardBanner({
  count,
  onVerify,
  onClose,
}: GiftVerificationCardBannerProps) {
  const { slot, card } = CARD_BANNER_MOTION;

  return (
    <MotionConfig reducedMotion="user">
      <motion.section
        aria-label="선물 인증 안내"
        className="w-full pb-3"
        initial={slot.initial}
        animate={slot.animate}
        transition={slot.transition}>
        <motion.div
          className="bg-semantic-fill-default/70 relative flex w-full flex-col items-end gap-3 rounded-[20px] p-4"
          initial={card.initial}
          animate={card.animate}
          transition={card.transition}>
          <div className="flex w-full items-start gap-10">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <GiftVerificationCount count={count} />
              <p className="text-semantic-text-tertiary [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-subtext-small)]">
                선물을 받았다면 친구들에게 도착을 알려주세요
              </p>
            </div>
            <IconButton
              size="small"
              icon={<IconClose />}
              aria-label="선물 인증 안내 닫기"
              onClick={onClose}
              className="relative z-10"
            />
          </div>
          <button
            type="button"
            onClick={onVerify}
            className="text-semantic-text-brand rounded-x-small flex max-w-[210px] cursor-pointer items-center [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-x-small)] before:absolute before:inset-0 before:rounded-[20px] before:content-['']">
            <span className="truncate">인증하러 가기</span>
            <IconRight aria-hidden className="size-4 shrink-0" />
          </button>
        </motion.div>
      </motion.section>
    </MotionConfig>
  );
}
