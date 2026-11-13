import type { Easing } from "framer-motion";

export type CardPose = {
  x: number;
  y: number;
  rotate: number;
};

// poses는 [시작(화면 밖), 모임, 일렬] 순서. 카드 크기는 일렬 크기로 고정이고 시작 scale로만 작아진다
export type RollingCard = {
  width: number;
  height: number;
  poses: CardPose[];
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
  },
  {
    width: LINED_WIDTH,
    height: 276.882,
    poses: [
      { x: -66, y: 270, rotate: 12.22 },
      { x: -11.24, y: -39.54, rotate: 3.62 },
      { x: 4.07, y: -13.37, rotate: -1.94 },
    ],
  },
  {
    width: LINED_WIDTH,
    height: 286.817,
    poses: [
      { x: 300, y: -127, rotate: -29.17 },
      { x: 6.51, y: -40.05, rotate: -10.64 },
      { x: -1.82, y: 26.34, rotate: 5.18 },
    ],
  },
  {
    width: LINED_WIDTH,
    height: 257.472,
    poses: [
      { x: -224, y: 103, rotate: -14.35 },
      { x: -0.85, y: -23.7, rotate: 8.77 },
      { x: 3.87, y: 52.79, rotate: -2.15 },
    ],
  },
  {
    width: LINED_WIDTH,
    height: 290.225,
    poses: [
      { x: 153, y: 137, rotate: 12.22 },
      { x: -12.89, y: -38.57, rotate: -2.08 },
      { x: 2.44, y: 139.89, rotate: 0 },
    ],
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
