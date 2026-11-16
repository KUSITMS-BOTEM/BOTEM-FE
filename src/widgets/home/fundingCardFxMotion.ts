import type { Easing, Transition } from "framer-motion";

export type FundingCardFxPhase = "idle" | "press" | "burst";

export type MotionPreset = {
  initial: Record<string, number>;
  animate: Record<string, number[]>;
  transition: Record<string, Transition>;
};

const LOOP_S = 3.2;
const BURST_S = 1.75;
const PRESS_S = 0.58;

const SINE: Easing = [0.45, 0, 0.55, 1];
const POP: Easing = [0.2, 0.8, 0.2, 1];
const RISE: Easing = [0, 0, 0.2, 1];
const BOUNCE: Easing = [0.34, 1.56, 0.64, 1];
const SWEEP: Easing = [0.65, 0, 0.35, 1];
const GATHER: Easing = [0.5, 0, 0.9, 0.6];
const BURST: Easing = [0.05, 0.85, 0.2, 1];
const WHITEOUT: Easing = [0.4, 0, 0.2, 1];

const loop = (times: number[], ease: Easing | Easing[]): Transition => ({
  duration: LOOP_S,
  times,
  ease,
  repeat: Infinity,
});

const once = (seconds: number[], ease: Easing | Easing[], duration = BURST_S): Transition => ({
  duration,
  times: seconds.map(s => s / duration),
  ease,
});

const SHAKE_TIMES = [
  0, 0.2969, 0.3063, 0.3172, 0.3281, 0.3391, 0.35, 0.3609, 0.3719, 0.3828, 0.3938, 0.4125,
];
const SHAKE_EASE: Easing[] = ["linear", ...Array<Easing>(10).fill(SINE)];

export const CARD_IDLE: MotionPreset = {
  initial: { rotate: 0, scale: 1, x: 0, y: 0 },
  animate: {
    rotate: [
      0, 0, -1.4, 1.4, -1.4, 1.4, -1.4, 1.4, -1.4, 1.4, -1.4, 0, 0, 2.5, -2, 1.5, -1, 0.5, 0, 0,
    ],
    scale: [1, 1, 1.02, 1, 1, 1.025, 1, 1],
    x: [0, 0, 1.8, -1.8, 1.8, -1.8, 1.8, -1.8, 1.8, -1.8, 1.8, 0, 0],
    y: [0, -3, 0, -3, 0],
  },
  transition: {
    rotate: loop(
      [...SHAKE_TIMES, 0.6563, 0.6813, 0.7125, 0.7438, 0.775, 0.8063, 0.8375, 1],
      [...SHAKE_EASE, "linear", SINE, SINE, SINE, SINE, SINE, SINE, "linear"],
    ),
    scale: loop(
      [0, 0.2969, 0.3438, 0.4219, 0.6406, 0.6875, 0.8125, 1],
      ["linear", POP, SINE, "linear", POP, SINE, "linear"],
    ),
    x: loop([...SHAKE_TIMES, 1], [...SHAKE_EASE, "linear"]),
    y: loop([0, 0.25, 0.5, 0.75, 1], SINE),
  },
};

// idle 흔들림의 회전·X가 중간값에 멈추지 않도록 눌림 시작과 함께 0으로 되돌린다
export const CARD_PRESS: MotionPreset = {
  initial: { rotate: 0, x: 0, scale: 1, y: 0 },
  animate: { rotate: [0, 0], x: [0, 0], scale: [1, 0.96, 1.02, 1], y: [0, 2, -2, 0] },
  transition: {
    rotate: once([0, PRESS_S], "linear", PRESS_S),
    x: once([0, PRESS_S], "linear", PRESS_S),
    scale: once([0, 0.1, 0.32, 0.58], [POP, SINE, SINE], PRESS_S),
    y: once([0, 0.1, 0.32, 0.58], [POP, SINE, SINE], PRESS_S),
  },
};

// 0.05~1.2s 동안 0.035s 간격으로 좌우 교차, 진폭은 회전 0.5°→3.6°·X 0.6→4.6px로 점점 커진다
const TREMBLE_START_S = 0.05;
const TREMBLE_END_S = 1.2;
const TREMBLE_STEP_S = 0.035;
const trembleSteps = Math.floor((TREMBLE_END_S - TREMBLE_START_S) / TREMBLE_STEP_S);
const trembleSeconds = Array.from(
  { length: trembleSteps },
  (_, i) => TREMBLE_START_S + TREMBLE_STEP_S * (i + 1),
);
const tremble = (from: number, to: number) =>
  trembleSeconds.map((_, i) => {
    const amplitude = from + ((to - from) * i) / (trembleSteps - 1);
    return i % 2 === 0 ? amplitude : -amplitude;
  });
const trembleTrack = (from: number, to: number): [number[], Transition] => [
  [0, 0, ...tremble(from, to), 0, 0],
  once(
    [0, TREMBLE_START_S, ...trembleSeconds, TREMBLE_END_S, BURST_S],
    ["linear", ...Array<Easing>(trembleSteps + 1).fill([0.42, 0, 0.58, 1]), "linear"],
  ),
];
const [trembleRotate, trembleRotateTransition] = trembleTrack(0.5, 3.6);
const [trembleX, trembleXTransition] = trembleTrack(0.6, 4.6);

export const CARD_BURST: MotionPreset = {
  initial: { rotate: 0, x: 0, scale: 1, y: 0, opacity: 1 },
  animate: {
    rotate: trembleRotate,
    x: trembleX,
    scale: [1, 1, 0.94, 1.9, 1.9],
    y: [0, 0, -22, -22],
    opacity: [1, 1, 0, 0],
  },
  transition: {
    rotate: trembleRotateTransition,
    x: trembleXTransition,
    scale: once([0, 0.7, 1.22, 1.55, BURST_S], ["linear", GATHER, BURST, "linear"]),
    y: once([0, 1.22, 1.55, BURST_S], ["linear", BURST, "linear"]),
    opacity: once([0, 1.42, 1.68, BURST_S], ["linear", SINE, "linear"]),
  },
};

export const GLOW: Record<FundingCardFxPhase, MotionPreset> = {
  idle: {
    initial: { opacity: 0.4, scale: 1 },
    animate: { opacity: [0.4, 0.5, 0.75, 0.5, 0.7, 0.4], scale: [1, 1.03, 1] },
    transition: {
      opacity: loop([0, 0.2969, 0.3594, 0.5, 0.6875, 1], [SINE, POP, SINE, POP, SINE]),
      scale: loop([0, 0.5, 1], SINE),
    },
  },
  press: {
    initial: { opacity: 0.45 },
    animate: { opacity: [0.45, 0.85, 0.45] },
    transition: { opacity: once([0, 0.1, 0.58], [POP, SINE], PRESS_S) },
  },
  burst: {
    initial: { opacity: 0.4 },
    animate: { opacity: [0.4, 0.4, 1, 1] },
    transition: { opacity: once([0, 1.22, 1.3, BURST_S], ["linear", POP, "linear"]) },
  },
};

export const BUTTON: Record<Exclude<FundingCardFxPhase, "burst">, MotionPreset> = {
  idle: {
    initial: { scale: 1 },
    animate: { scale: [1, 1, 1.06, 1, 1, 1.07, 1, 1.04, 1, 1] },
    transition: {
      scale: loop(
        [0, 0.3125, 0.3438, 0.3813, 0.6563, 0.6938, 0.7313, 0.7688, 0.8188, 1],
        ["linear", POP, SINE, "linear", POP, SINE, POP, SINE, "linear"],
      ),
    },
  },
  press: {
    initial: { scale: 1 },
    animate: { scale: [1, 0.93, 1.06, 1] },
    transition: { scale: once([0, 0.1, 0.32, 0.58], [POP, SINE, SINE], PRESS_S) },
  },
};

export const FLASH: MotionPreset = {
  initial: { opacity: 0 },
  animate: { opacity: [0, 0, 0.65, 0, 0] },
  transition: { opacity: once([0, 1.22, 1.28, 1.42, BURST_S], ["linear", POP, SINE, "linear"]) },
};

export const WHITEOUT_FADE: MotionPreset = {
  initial: { opacity: 0 },
  animate: { opacity: [0, 0, 1, 1] },
  transition: { opacity: once([0, 1.26, 1.6, BURST_S], ["linear", WHITEOUT, "linear"]) },
};

export const HOLO_BAND: MotionPreset = {
  initial: { x: 0 },
  animate: { x: [0, 0, 560, 560] },
  transition: { x: loop([0, 0.0938, 0.4688, 1], ["linear", SWEEP, "linear"]) },
};

export const BUTTON_SHINE: MotionPreset = {
  initial: { x: 0 },
  animate: { x: [0, 0, 271, 271, 0, 0, 271, 271] },
  transition: {
    x: loop(
      [0, 0.1875, 0.3438, 0.344, 0.3441, 0.8594, 0.9844, 1],
      ["linear", SINE, "linear", "linear", "linear", SINE, "linear"],
    ),
  },
};

const ripple = (start: number, end: number, second: number, secondEnd: number): MotionPreset => ({
  initial: { opacity: 0, scaleX: 1, scaleY: 1 },
  animate: {
    opacity: [0, 0, 0.7, 0, 0, 0.7, 0, 0],
    scaleX: [1, 1, 1.45, 1, 1.45, 1.45],
    scaleY: [1, 1, 1.72, 1, 1.72, 1.72],
  },
  transition: {
    opacity: loop(
      [0, start - 0.0004, start, end, second - 0.0004, second, secondEnd, 1],
      ["linear", "linear", RISE, "linear", "linear", RISE, "linear"],
    ),
    scaleX: loop([0, start, end, second, secondEnd, 1], ["linear", RISE, "linear", RISE, "linear"]),
    scaleY: loop([0, start, end, second, secondEnd, 1], ["linear", RISE, "linear", RISE, "linear"]),
  },
});

export const RIPPLES: MotionPreset[] = [
  ripple(0.0313, 0.3125, 0.5313, 0.8125),
  ripple(0.1188, 0.4, 0.6188, 0.9),
];

export const play = (preset: MotionPreset, active: boolean) => ({
  initial: preset.initial,
  animate: active ? preset.animate : preset.initial,
  transition: active ? preset.transition : { duration: 0 },
});

const sparkle = (start: number): MotionPreset => {
  const peak = start + 0.0469;
  const pop = start + 0.0781;
  const end = start + 0.1875;
  return {
    initial: { opacity: 0, rotate: 0, scale: 0.3 },
    animate: { opacity: [0, 0, 1, 0, 0], rotate: [0, 0, -45, -45], scale: [0.3, 0.3, 1, 0.3, 0.3] },
    transition: {
      opacity: loop([0, start, peak, end, 1], ["linear", POP, SINE, "linear"]),
      rotate: loop([0, start, end, 1], ["linear", POP, "linear"]),
      scale: loop([0, start, pop, end, 1], ["linear", BOUNCE, SINE, "linear"]),
    },
  };
};

export const SPARKLES: { position: string; preset: MotionPreset }[] = [
  { position: "left-8.5 top-8.5 size-3", preset: sparkle(0.1563) },
  { position: "left-[269px] top-[51px] size-3.5", preset: sparkle(0.2969) },
  { position: "left-[245px] top-[245px] size-2.5", preset: sparkle(0.5313) },
  { position: "left-[65.5px] top-[115.5px] size-[9px]", preset: sparkle(0.7188) },
];

// 기간 만료·참여자 0명 카드 (Figma 6680:57920 대기 루프 · 6680:61654 탭 전환)
export type FundingCardExpiredFxPhase = "idle" | "press";

const EXPIRED_LOOP_S = 3.6;
const EXPIRED_EXIT_S = 1.1;
const STANDARD: Easing = [0.4, 0, 0.2, 1];

const expiredLoop = (times: number[], ease: Easing | Easing[]): Transition => ({
  duration: EXPIRED_LOOP_S,
  times,
  ease,
  repeat: Infinity,
});

export const EXPIRED_CARD: Record<FundingCardExpiredFxPhase, MotionPreset> = {
  idle: {
    initial: { rotate: 0, scale: 1, y: 0 },
    animate: { rotate: [0, 0, 1.4, -1.1, 0.5, 0, 0], y: [0, -3, 0] },
    transition: {
      rotate: expiredLoop(
        [0, 0.6389, 0.6889, 0.7389, 0.7889, 0.8389, 1],
        ["linear", SINE, SINE, SINE, SINE, "linear"],
      ),
      y: expiredLoop([0, 0.5, 1], SINE),
    },
  },
  press: {
    initial: { rotate: 0, scale: 1, y: 0 },
    animate: { rotate: [0, 0], scale: [1, 0.97, 0.995, 0.975], y: [0, 1.5, 0.5, 5] },
    transition: {
      rotate: once([0, EXPIRED_EXIT_S], "linear", EXPIRED_EXIT_S),
      scale: once([0, 0.1, 0.32, EXPIRED_EXIT_S], [POP, SINE, STANDARD], EXPIRED_EXIT_S),
      y: once([0, 0.1, 0.32, EXPIRED_EXIT_S], [POP, SINE, STANDARD], EXPIRED_EXIT_S),
    },
  },
};

export const EXPIRED_GLOW: MotionPreset = {
  initial: { opacity: 0.18 },
  animate: { opacity: [0.18, 0.32, 0.18, 0.18] },
  transition: { opacity: expiredLoop([0, 0.3333, 0.6667, 1], [SINE, SINE, "linear"]) },
};

export const EXPIRED_SWEEP: MotionPreset = {
  initial: { x: 0 },
  animate: { x: [0, 0, 560, 560] },
  transition: { x: expiredLoop([0, 0.1389, 0.4167, 1], ["linear", SWEEP, "linear"]) },
};

export const EXPIRED_BUTTON: Record<FundingCardExpiredFxPhase, MotionPreset> = {
  idle: {
    initial: { scale: 1 },
    animate: { scale: [1, 1, 1.05, 1, 1, 1.03, 1, 1] },
    transition: {
      scale: expiredLoop(
        [0, 0.3472, 0.3944, 0.4722, 0.6889, 0.7222, 0.7917, 1],
        ["linear", POP, SINE, "linear", POP, SINE, "linear"],
      ),
    },
  },
  press: {
    initial: { scale: 1 },
    animate: { scale: [1, 0.95, 1] },
    transition: { scale: once([0, 0.1, 0.32], [POP, SINE], 0.32) },
  },
};

// 홈이 0.32~1.05s에 걸쳐 사라지는 것을 화면 전체 페이드로 표현하고, 끝나면 결과 화면으로 이동한다
export const EXPIRED_EXIT_FADE: MotionPreset = {
  initial: { opacity: 0 },
  animate: { opacity: [0, 0, 1, 1] },
  transition: {
    opacity: once([0, 0.32, 1.05, EXPIRED_EXIT_S], ["linear", STANDARD, "linear"], EXPIRED_EXIT_S),
  },
};
