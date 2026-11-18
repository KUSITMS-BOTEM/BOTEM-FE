"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, PresenceContext } from "framer-motion";
import { cn } from "@/utils/cn";
import {
  BUTTON,
  BUTTON_SHINE,
  CARD_BURST,
  CARD_IDLE,
  CARD_PRESS,
  FLASH,
  GLOW,
  HOLO_BAND,
  play,
  RIPPLES,
  SPARKLES,
  WHITEOUT_FADE,
  type FundingCardFxPhase,
} from "@/widgets/home/fundingCardFxMotion";
import IconSparkle from "@/assets/icons/icon-sparkle.svg?react";

type FundingCardCompleteFxProps = {
  label: string;
  labelId: string;
  phase: FundingCardFxPhase;
  animate: boolean;
  onPressEnd: () => void;
  onBurstEnd: () => void;
  children: ReactNode;
};

const HOLO_BAND_FILL =
  "bg-[linear-gradient(90deg,transparent_0%,color-mix(in_srgb,var(--color-semantic-fill-default)_35%,transparent)_30%,color-mix(in_srgb,var(--color-semantic-fill-default)_90%,transparent)_50%,color-mix(in_srgb,var(--color-semantic-fill-default)_35%,transparent)_70%,transparent_100%)]";

export default function FundingCardCompleteFx({
  label,
  labelId,
  phase,
  animate,
  onPressEnd,
  onBurstEnd,
  children,
}: FundingCardCompleteFxProps) {
  const looping = animate && phase === "idle";
  const cardPreset = { idle: CARD_IDLE, press: CARD_PRESS, burst: CARD_BURST }[phase];
  const buttonPreset = phase === "burst" ? BUTTON.idle : BUTTON[phase];

  // 상위 캐러셀의 AnimatePresence initial={false}가 첫 카드의 마운트 애니메이션을 막아 루프가 첫 진입에 멈춘다 — 이펙트 영역은 presence에서 떼어 낸다
  return (
    <PresenceContext.Provider value={null}>
      <motion.div
        aria-hidden
        {...play(GLOW[phase], animate)}
        className="bg-semantic-fill-brand pointer-events-none absolute top-3.5 left-3 h-[372px] w-[296px] rounded-3xl blur-[17px]"
      />
      <motion.div
        {...play(cardPreset, animate)}
        onAnimationComplete={phase === "press" ? onPressEnd : undefined}
        className="relative w-full">
        {children}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-clip rounded-3xl">
          <div className="bg-semantic-fill-default absolute inset-0 opacity-6" />
          <div className="absolute -top-[150.5px] -left-[322px] flex h-[699px] w-[404px] items-center justify-center">
            <div className="-rotate-25">
              <motion.div
                {...play(HOLO_BAND, looping)}
                className={cn(HOLO_BAND_FILL, "h-[720px] w-[110px] opacity-45")}
              />
            </div>
          </div>
          <motion.div
            {...play(FLASH, animate && phase === "burst")}
            className="bg-semantic-fill-default absolute inset-0"
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-44 flex justify-center">
          <div className="relative">
            {RIPPLES.map((ripple, index) => (
              <motion.div
                key={index}
                aria-hidden
                {...play(ripple, looping)}
                className="border-semantic-fill-brand absolute -inset-x-1 inset-y-0 rounded-full border-2"
              />
            ))}
            <motion.p
              id={labelId}
              {...play(buttonPreset, animate && phase !== "burst")}
              className="bg-semantic-fill-brand text-semantic-text-on-fill relative flex h-8 items-center overflow-clip rounded-full px-3 [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-subtext-small)]">
              {label}
              <span
                aria-hidden
                className="absolute -top-[9.58px] -left-[56.84px] flex h-[39.65px] w-[37.26px] items-center justify-center">
                <span className="-rotate-20">
                  <motion.span
                    {...play(BUTTON_SHINE, looping)}
                    className="via-semantic-fill-default/55 block h-8 w-7 bg-linear-to-r from-transparent to-transparent"
                  />
                </span>
              </span>
            </motion.p>
          </div>
        </div>
        {SPARKLES.map(({ position, preset }) => (
          <motion.span
            key={position}
            aria-hidden
            {...play(preset, looping)}
            className={cn("pointer-events-none absolute", position)}>
            <IconSparkle className="text-semantic-icon-on-fill size-full drop-shadow-[0_0_6px_color-mix(in_srgb,var(--color-base-orange-500)_50%,transparent)]" />
          </motion.span>
        ))}
      </motion.div>
      {phase === "burst" &&
        createPortal(
          <motion.div
            aria-hidden
            {...play(WHITEOUT_FADE, animate)}
            onAnimationComplete={onBurstEnd}
            className="bg-semantic-background-default fixed inset-0 z-50"
          />,
          document.body,
        )}
    </PresenceContext.Provider>
  );
}
