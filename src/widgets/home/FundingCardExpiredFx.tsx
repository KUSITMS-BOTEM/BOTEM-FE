"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, PresenceContext } from "framer-motion";
import {
  EXPIRED_BUTTON,
  EXPIRED_CARD,
  EXPIRED_EXIT_FADE,
  EXPIRED_GLOW,
  EXPIRED_SWEEP,
  play,
  type FundingCardExpiredFxPhase,
} from "@/widgets/home/fundingCardFxMotion";

type FundingCardExpiredFxProps = {
  label: string;
  labelId: string;
  phase: FundingCardExpiredFxPhase;
  animate: boolean;
  onExitEnd: () => void;
  children: ReactNode;
};

export default function FundingCardExpiredFx({
  label,
  labelId,
  phase,
  animate,
  onExitEnd,
  children,
}: FundingCardExpiredFxProps) {
  const pressing = phase === "press";

  // 상위 캐러셀의 AnimatePresence initial={false}가 첫 카드의 마운트 애니메이션을 막아 루프가 첫 진입에 멈춘다 — 이펙트 영역은 presence에서 떼어 낸다
  return (
    <PresenceContext.Provider value={null}>
      <motion.div
        aria-hidden
        {...play(EXPIRED_GLOW, animate)}
        className="bg-base-gray-400 pointer-events-none absolute top-3.5 left-3 h-[372px] w-[296px] rounded-3xl blur-[17px]"
      />
      <motion.div {...play(EXPIRED_CARD[phase], animate)} className="relative w-full">
        {children}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-clip rounded-3xl">
          <div className="absolute -top-[150.5px] -left-[322px] flex h-[699px] w-[404px] items-center justify-center">
            <div className="-rotate-25">
              <motion.div
                {...play(EXPIRED_SWEEP, animate && !pressing)}
                className="via-semantic-fill-default/90 h-[720px] w-[110px] bg-linear-to-r from-transparent to-transparent opacity-55"
              />
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-44 flex justify-center">
          <motion.p
            id={labelId}
            {...play(EXPIRED_BUTTON[phase], animate)}
            className="bg-semantic-fill-neutral-weak text-semantic-text-primary flex h-8 items-center rounded-full px-3 [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-subtext-small)]">
            {label}
          </motion.p>
        </div>
      </motion.div>
      {pressing &&
        createPortal(
          <motion.div
            aria-hidden
            {...play(EXPIRED_EXIT_FADE, animate)}
            onAnimationComplete={onExitEnd}
            className="bg-semantic-background-default fixed inset-0 z-50"
          />,
          document.body,
        )}
    </PresenceContext.Provider>
  );
}
