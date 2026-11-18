import type { Easing, Transition } from "framer-motion";

const FIGMA_SPRING: Easing = t =>
  1 - Math.exp(-t * 7.6657) * (Math.cos(t * 6.7605) + 1.1339 * Math.sin(t * 6.7605));
const DOT_POP: Easing = [0.45, 1.45, 0.8, 1];

export const CARD_BANNER_MOTION = {
  slot: {
    initial: { height: 0 },
    animate: { height: "auto" },
    transition: { delay: 0.2, duration: 0.6, ease: FIGMA_SPRING } satisfies Transition,
  },
  card: {
    initial: { opacity: 0, y: -40 },
    animate: { opacity: 1, y: 0 },
    transition: {
      opacity: { delay: 0.2, duration: 0.4, ease: "easeOut" },
      y: { delay: 0.2, duration: 0.6, ease: FIGMA_SPRING },
    } satisfies Transition,
  },
};

export const PINNED_BANNER_MOTION = {
  sheet: {
    initial: { opacity: 0, y: -72 },
    animate: { opacity: 1, y: 0 },
    transition: {
      opacity: { delay: 0.2, duration: 0.35, ease: "easeOut" },
      y: { delay: 0.2, duration: 0.6, ease: FIGMA_SPRING },
    } satisfies Transition,
  },
  dot: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { delay: 0.85, duration: 0.25, ease: DOT_POP } satisfies Transition,
  },
  bell: {
    initial: { rotate: 0 },
    animate: { rotate: [0, 20, -15, 10, -6, 3, 0] },
    transition: {
      delay: 1.1,
      duration: 0.96,
      times: [0, 0.146, 0.354, 0.542, 0.708, 0.854, 1],
      ease: ["easeOut", "easeInOut", "easeInOut", "easeInOut", "easeInOut", "easeOut"],
    } satisfies Transition,
  },
  glow: {
    initial: { opacity: 0, scale: 0.7 },
    animate: { opacity: [0, 0.9, 0], scale: [0.7, 1.5] },
    transition: {
      opacity: { delay: 1.1, duration: 0.8, times: [0, 0.15, 1], ease: ["easeOut", "easeIn"] },
      scale: { delay: 1.1, duration: 0.8, ease: "easeOut" },
    } satisfies Transition,
  },
};
