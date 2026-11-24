"use client";

import { motion, MotionConfig } from "framer-motion";

import IconButton from "@/components/IconButton";
import { CARD_BANNER_MOTION } from "@/widgets/home/giftVerificationBannerMotion";
import IconClose from "@/assets/icons/icon-close.svg?react";
import IconRight from "@/assets/icons/icon-right.svg?react";

type SurpriseRevealBannerProps = {
  organizerName: string;
  participantCount: number;
  onOpen: () => void;
  onClose: () => void;
};

// 주최자도 보탬 한 건으로 세므로, 함께한 친구 수는 주최자를 뺀 인원이다
const toPreparedByText = (organizerName: string, participantCount: number) => {
  const others = participantCount - 1;
  return others > 0
    ? `${organizerName}외 ${others}명이 함께 준비했어요`
    : `${organizerName}님이 준비했어요`;
};

// 공개된 서프라이즈를 받는 사람에게 알리는 홈 배너 (HOME-PG-001(4)). 선물 인증 배너와 같은 카드형이다
export default function SurpriseRevealBanner({
  organizerName,
  participantCount,
  onOpen,
  onClose,
}: SurpriseRevealBannerProps) {
  const { slot, card } = CARD_BANNER_MOTION;

  return (
    <MotionConfig reducedMotion="user">
      <motion.section
        aria-label="서프라이즈 선물 안내"
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
            <div className="flex min-w-0 flex-1 flex-col gap-1 [letter-spacing:var(--letter-spacing-default)]">
              <p className="text-semantic-text-primary [font:var(--semantic-label-medium-strong)]">
                친구들이 몰래 준비한 선물이 있어요
              </p>
              <p className="text-semantic-text-tertiary [font:var(--semantic-subtext-small)]">
                {toPreparedByText(organizerName, participantCount)}
              </p>
            </div>
            <IconButton
              size="small"
              icon={<IconClose />}
              aria-label="서프라이즈 선물 안내 닫기"
              onClick={onClose}
              className="relative z-10"
            />
          </div>
          <button
            type="button"
            onClick={onOpen}
            className="text-semantic-text-brand rounded-x-small flex max-w-[210px] cursor-pointer items-center [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-x-small)] before:absolute before:inset-0 before:rounded-[20px] before:content-['']">
            <span className="truncate">열어보기</span>
            <IconRight aria-hidden className="size-4 shrink-0" />
          </button>
        </motion.div>
      </motion.section>
    </MotionConfig>
  );
}
