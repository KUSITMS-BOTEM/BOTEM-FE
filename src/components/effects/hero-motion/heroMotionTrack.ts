import { HERO_EASES } from "./heroMotionData";

/** [시간 0~1 비율, 값, 구간별 HERO_EASES 인덱스(값 개수 - 1)] */
export type HeroTrack = readonly [times: number[], values: number[], eases: number[]];

/** x·y는 px, r은 deg, s·sx·sy는 배율, o는 opacity */
export type HeroTrackSet = Partial<Record<"x" | "y" | "r" | "s" | "sx" | "sy" | "o", HeroTrack>>;

export type HeroParticle = {
  k: "star" | "circle" | "bar";
  c: "orange" | "blue" | "lime" | "pink";
  /** 위치·크기 Tailwind 클래스 */
  p: string;
} & Pick<HeroTrackSet, "x" | "y" | "r" | "s" | "o">;

export const HERO_DURATION = 6.8;

const PROP_NAME = {
  x: "x",
  y: "y",
  r: "rotate",
  s: "scale",
  sx: "scaleX",
  sy: "scaleY",
  o: "opacity",
} as const;

type HeroMotionProps = {
  initial?: Record<string, number>;
  animate?: Record<string, number[]>;
  transition?: Record<string, object>;
};

/** 트랙 묶음을 framer-motion의 initial/animate/transition으로 바꾼다. playing=false면 변형 없이 기본 상태로 둔다 */
export const toMotion = (tracks: HeroTrackSet, playing = true): HeroMotionProps => {
  const initial: Record<string, number> = {};
  const animate: Record<string, number[]> = {};
  const transition: Record<string, object> = {};

  for (const [key, track] of Object.entries(tracks) as [keyof HeroTrackSet, HeroTrack][]) {
    const [times, values, eases] = track;
    const name = PROP_NAME[key];
    initial[name] = values[0];
    animate[name] = values;
    transition[name] = {
      duration: HERO_DURATION,
      times,
      ease: eases.map(index => HERO_EASES[index]),
      repeat: Infinity,
    };
  }

  return playing ? { initial, animate, transition } : {};
};
