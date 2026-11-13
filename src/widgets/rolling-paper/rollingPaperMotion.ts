import type { Easing } from "framer-motion";

export type CardPose = {
  x: number;
  y: number;
  rotate: number;
};

// 일렬 포즈에서 아래로 떨어지는 퇴장 모션. dx·dy는 일렬 포즈 기준 이동량(px), start·end는 클릭 시점 기준 초
export type CardExit = {
  dx: number;
  dy: number;
  start: number;
  end: number;
};

// poses는 [시작(화면 밖), 모임, 일렬] 순서. 카드 크기는 일렬 크기로 고정이고 시작 scale로만 작아진다
export type RollingCard = {
  width: number;
  height: number;
  poses: CardPose[];
  exit: CardExit;
};

// 디자인팀 모션 스펙(총 1.65s): 0~0.1 대기 → 0.1~0.7 모임 → 0.7~1.2 쉼 → 1.2~1.65 펼침
const WAIT_END = 0.1;
const GATHER_END = 0.7;
const HOLD_END = 1.2;
const TOTAL_DURATION = 1.65;
const EASE_GATHER: Easing = [0.16, 1, 0.3, 1];
const EASE_FADE: Easing = [0.33, 0, 0.2, 1];
const EASE_SPREAD: Easing = [0.34, 1.4, 0.5, 1];

export const START_SCALE = 0.527;
export const START_OPACITY = 0.6;
export const SHEET_SLIDE_DURATION = 0.3;
// 시트가 다 펼쳐진 뒤 모션이 시작되기까지의 대기 시간
export const MOTION_START_DELAY = SHEET_SLIDE_DURATION;
export const CARD_RADIUS = 19.29;

const TIMES = [0, WAIT_END, GATHER_END, HOLD_END, TOTAL_DURATION].map(
  time => time / TOTAL_DURATION,
);
const timeline = (ease: Easing[]) => ({
  duration: TOTAL_DURATION,
  delay: MOTION_START_DELAY,
  times: TIMES,
  ease,
});
// framer-motion은 값별 transition이 전체 설정을 대체하므로 값마다 duration·times를 모두 적는다
const POSE_TRANSITION = timeline(["linear", EASE_GATHER, "linear", EASE_SPREAD]);

export const CARD_TRANSITION = {
  x: POSE_TRANSITION,
  y: POSE_TRANSITION,
  rotate: POSE_TRANSITION,
  scale: timeline(["linear", EASE_GATHER, "linear", "linear"]),
  opacity: timeline(["linear", EASE_FADE, "linear", "linear"]),
};

// 디자인팀 퇴장 스펙(2.4s 전환 중 앞 1.1s): 클릭 후 헤더·카드 배경·안내 문구가 사라지고 카드가 아래로 떨어진다
const EASE_FALL: Easing = [0.5, 0, 0.75, 0];
const EASE_HEADER_FADE: Easing = [0.45, 0, 0.55, 1];
const EASE_GRAY_AREA: Easing = [0.65, 0, 0.35, 1];

export const EXIT_HEADER_TRANSITION = { delay: 0.5, duration: 0.45, ease: EASE_HEADER_FADE };
// 페이지 이동 뒤 도착 화면에서는 클릭 시점 타임라인이 끊겨 지연 없이 바로 페이드인한다
export const ARRIVAL_BACK_BUTTON_TRANSITION = { duration: 0.45, ease: EASE_HEADER_FADE };
// 도착 화면 등장 모션. 디자인 2.4s 타임라인에서 회색 덮개가 끝나는 1.1s부터 페이지가 시작되므로 그만큼 앞당긴다
const ARRIVAL_OFFSET = 1.1;
const EASE_ARRIVAL_ROTATE: Easing = [0.25, 1, 0.4, 1];
const EASE_ARRIVAL_X: Easing = [0.4, 0.6, 0.3, 1];
const EASE_ARRIVAL_Y: Easing = [0.22, 1, 0.36, 1];
const EASE_PROFILE_DROP: Easing = [0.32, 1.2, 0.5, 1];
const ARRIVAL_CARD_FADE_DURATION = 0.3;

export const ARRIVAL_BG_TRANSITION = { duration: 0.3, ease: EASE_FADE };

// x·y·rotate(deg)·scale은 최종 위치 기준 시작 오프셋, start·end는 디자인 타임라인 기준 초
export type ArrivalCardEntrance = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  start: number;
  end: number;
};

// 아이템 번호 순서(진행 0일 때 중앙·아래·맨 아래·맨 위·위)이며 디자인의 Haeun·Haeun·Seojun·Sua·Seojun 카드에 해당
export const ARRIVAL_CARD_ENTRANCES: ArrivalCardEntrance[] = [
  { x: -192.461, y: -535.975, rotate: 34, scale: 1.3089, start: 1.17, end: 1.97 },
  { x: 184.396, y: -536.269, rotate: 34, scale: 0.764, start: 1.11, end: 1.91 },
  { x: 191.413, y: -490.746, rotate: 33.4, scale: 1, start: 1.08, end: 1.88 },
  { x: -8.497, y: -594.232, rotate: 35.2, scale: 1, start: 1.14, end: 1.94 },
  { x: 118.738, y: -496.98, rotate: 34, scale: 1, start: 1.05, end: 1.85 },
];

export function toArrivalCardTransition({ start, end }: ArrivalCardEntrance) {
  const delay = Math.max(0, start - ARRIVAL_OFFSET);
  const duration = end - ARRIVAL_OFFSET - delay;
  const timing = (ease: Easing) => ({ delay, duration, ease });

  return {
    x: timing(EASE_ARRIVAL_X),
    y: timing(EASE_ARRIVAL_Y),
    rotate: timing(EASE_ARRIVAL_ROTATE),
    scale: timing(EASE_ARRIVAL_Y),
    opacity: { delay, duration: ARRIVAL_CARD_FADE_DURATION, ease: EASE_FADE },
  };
}

export const ARRIVAL_PROFILE_FROM = { y: -24, opacity: 0 };
export const ARRIVAL_PROFILE_TO = { y: 0, opacity: 1 };
export const ARRIVAL_PROFILE_TRANSITION = {
  y: { delay: 0.4, duration: 0.4, ease: EASE_PROFILE_DROP },
  opacity: { delay: 0.4, duration: 0.35, ease: EASE_FADE },
};

export const EXIT_BACKGROUND_TRANSITION = { delay: 0.55, duration: 0.1, ease: EASE_FADE };
export const EXIT_HINT_TRANSITION = { delay: 0.5, duration: 0.35, ease: EASE_FADE };

// 하단 CTA는 BottomCTA가 fixed라 transform 조상을 둘 수 없어 className으로 transition을 건다
export const EXIT_CTA_CLASS =
  "[transition:translate_0.4s_cubic-bezier(0.5,0,0.75,0)_0.35s,opacity_0.35s_cubic-bezier(0.33,0,0.2,1)_0.35s]";
export const EXIT_CTA_HIDDEN_CLASS = "translate-y-[170px] opacity-0";

// 디자인 낙하 거리만으로는 카드 윗부분이 화면에 남아, 뷰포트 높이 약 1180px까지 완전히 벗어나도록 더 내린다
// shortcut: 뷰포트 높이와 무관한 고정값, 더 큰 화면을 지원하게 되면 뷰포트 기준 계산으로 교체
const EXIT_OFFSCREEN_EXTRA = 400;

// 회색 덮개는 카드 배경 위치(시트 헤더 64 + 패딩 4 + 문구 98 = 상단 166, 좌우 20)에서 시트 전체로 커진다.
// shortcut: 하단 32%는 812px 높이 기준 근사치, 시작은 투명해 어긋나도 눈에 띄지 않음
export const EXIT_COVER_START = {
  opacity: 0,
  clipPath: "inset(166px 20px 32% 20px round 16px)",
};
export const EXIT_COVER_END = { opacity: 1, clipPath: "inset(0px 0px 0% 0px round 0px)" };
export const EXIT_COVER_TRANSITION = {
  opacity: { delay: 0.55, duration: 0.07, ease: EASE_FADE },
  clipPath: { delay: 0.55, duration: 0.55, ease: EASE_GRAY_AREA },
};

// 일렬 단계의 회전은 낙하하며 0°로 펴진다(디자인의 회전 변화량이 일렬 회전과 부호만 반대)
export function toExitTarget(card: RollingCard) {
  const lined = card.poses[LINED_STAGE];
  const y = lined.y + card.exit.dy + EXIT_OFFSCREEN_EXTRA;

  return { x: lined.x + card.exit.dx, y, rotate: 0, scale: 1, opacity: 1 };
}

export function toExitTransition({ start, end }: CardExit) {
  const transition = { delay: start, duration: end - start, ease: EASE_FALL };

  return {
    x: transition,
    y: transition,
    rotate: transition,
    scale: transition,
    opacity: transition,
  };
}

const LINED_WIDTH = 250.768;
const LINED_STAGE = 2;

// x·y는 Card Area 중심 기준 오프셋(px). 슬롯 번호가 클수록 위에 쌓인다.
// 슬롯 0~4는 디자인의 Doyun·Haeun·Yejun·Sua·Seojun 카드
export const ROLLING_CARDS: RollingCard[] = [
  {
    width: LINED_WIDTH,
    height: 272.061,
    poses: [
      { x: -300, y: -117, rotate: 12.22 },
      { x: -1.68, y: -39.54, rotate: 12.22 },
      { x: -0.43, y: -54.18, rotate: 4.19 },
    ],
    exit: { dx: 0.351, dy: 577.177, start: 0.46, end: 0.88 },
  },
  {
    width: LINED_WIDTH,
    height: 276.882,
    poses: [
      { x: -66, y: 270, rotate: 12.22 },
      { x: -11.24, y: -39.54, rotate: 3.62 },
      { x: 4.07, y: -13.37, rotate: -1.94 },
    ],
    exit: { dx: -3.254, dy: 536.368, start: 0.42, end: 0.84 },
  },
  {
    width: LINED_WIDTH,
    height: 286.817,
    poses: [
      { x: 300, y: -127, rotate: -29.17 },
      { x: 6.51, y: -40.05, rotate: -10.64 },
      { x: -1.82, y: 26.34, rotate: 5.18 },
    ],
    exit: { dx: 1.453, dy: 496.659, start: 0.38, end: 0.8 },
  },
  {
    width: LINED_WIDTH,
    height: 257.472,
    poses: [
      { x: -224, y: 103, rotate: -14.35 },
      { x: -0.85, y: -23.7, rotate: 8.77 },
      { x: 3.87, y: 52.79, rotate: -2.15 },
    ],
    exit: { dx: -3.097, dy: 470.203, start: 0.34, end: 0.76 },
  },
  {
    width: LINED_WIDTH,
    height: 290.225,
    poses: [
      { x: 153, y: 137, rotate: 12.22 },
      { x: -12.89, y: -38.57, rotate: -2.08 },
      { x: 2.44, y: 139.89, rotate: 0 },
    ],
    exit: { dx: -1.907, dy: 382.888, start: 0.3, end: 0.72 },
  },
];

export const MAX_CARDS = ROLLING_CARDS.length;
// 편지지가 추가되는 순서(우상 → 좌하 → 우하 → 좌상 → 하단)에 해당하는 슬롯 번호
const SLOT_BY_ORDER = [2, 3, 4, 1, 0];

function lineCenterY(cards: RollingCard[]) {
  const top = Math.min(...cards.map(({ poses, height }) => poses[LINED_STAGE].y - height / 2));
  const bottom = Math.max(...cards.map(({ poses, height }) => poses[LINED_STAGE].y + height / 2));
  return (top + bottom) / 2;
}

// 화면에 보일 카드의 슬롯 번호를 쌓임 순서로 돌려준다. getVisibleCards와 같은 순서라 React key로 쓴다.
export function getVisibleSlots(count: number): number[] {
  return SLOT_BY_ORDER.slice(0, Math.min(count, MAX_CARDS)).sort((a, b) => a - b);
}

// 화면에 보일 카드만 골라 슬롯(쌓임) 순서로 돌려준다. 일렬 단계는 5장일 때의 세로 중심에 맞춰 y를 보정한다.
// shortcut: 회전은 무시하고 높이만으로 중심을 계산, 디자인이 따로 나오면 교체
export function getVisibleCards(count: number): RollingCard[] {
  const visible = getVisibleSlots(count).map(slot => ROLLING_CARDS[slot]);
  const shift = lineCenterY(ROLLING_CARDS) - lineCenterY(visible);

  return visible.map(card => ({
    ...card,
    poses: card.poses.map((pose, stage) =>
      stage === LINED_STAGE ? { ...pose, y: pose.y + shift } : pose,
    ),
  }));
}

// 대기·쉼 구간은 같은 포즈를 두 번 둬서 멈춘 것처럼 만든다
export function toKeyframes([start, gathered, lined]: CardPose[]) {
  const stops = [start, start, gathered, gathered, lined];

  return {
    x: stops.map(pose => pose.x),
    y: stops.map(pose => pose.y),
    rotate: stops.map(pose => pose.rotate),
    scale: [START_SCALE, START_SCALE, 1, 1, 1],
    opacity: [START_OPACITY, START_OPACITY, 1, 1, 1],
  };
}
