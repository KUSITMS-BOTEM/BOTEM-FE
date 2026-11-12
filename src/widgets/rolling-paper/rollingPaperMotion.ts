export type CardPose = {
  x: number;
  y: number;
  rotate: number;
  width: number;
  height: number;
  borderRadius: number;
};

// 디자인에 모션 값이 없어 임시로 정한 값. 디자인팀 값이 오면 여기만 고친다
export const STAGE_DURATION = 0.5;
export const SHEET_SLIDE_DURATION = 0.3;
// 시트가 다 펼쳐진 뒤 모션이 시작되기까지의 대기 시간
export const MOTION_START_DELAY = SHEET_SLIDE_DURATION;
export const EASE_STANDARD = [0.2, 0, 0, 1] as const;
// [흩어짐(A-1), 모임(A-2), 일렬(A-3)]을 같은 비율로 나눈 keyframe 시점
export const STAGE_TIMES = [0, 0.5, 1] as const;

const SCATTERED_SIZE = { width: 132.199, height: 153, borderRadius: 10.169 };
const GATHERED_SIZE = { width: 249.873, height: 289.189, borderRadius: 19.22 };
const LINED_WIDTH = 250.768;
const LINED_RADIUS = 19.29;

// x·y는 Card Area 중심 기준 오프셋(px). 슬롯 번호가 클수록 위에 쌓인다.
// Figma 프레임 이름은 모션 A-1·A-2·A-3에서 쌓임 순서가 서로 달라, 이름이 아니라 쌓임 순서로 같은 장을 이었다
export const CARD_POSES: CardPose[][] = [
  [
    { x: -66.2, y: 269.76, rotate: 12.22, ...SCATTERED_SIZE },
    { x: -1.68, y: -9.54, rotate: 12.22, ...GATHERED_SIZE },
    {
      x: -0.43,
      y: -54.18,
      rotate: 4.19,
      width: LINED_WIDTH,
      height: 272.061,
      borderRadius: LINED_RADIUS,
    },
  ],
  [
    { x: -191.2, y: -278.24, rotate: 12.22, ...SCATTERED_SIZE },
    { x: -11.24, y: -9.54, rotate: 3.62, ...GATHERED_SIZE },
    {
      x: 4.07,
      y: -13.37,
      rotate: -1.94,
      width: LINED_WIDTH,
      height: 276.882,
      borderRadius: LINED_RADIUS,
    },
  ],
  [
    { x: 164, y: -184.99, rotate: -29.17, ...SCATTERED_SIZE },
    { x: 6.51, y: -10.05, rotate: -10.64, ...GATHERED_SIZE },
    {
      x: -1.82,
      y: 26.34,
      rotate: 5.18,
      width: LINED_WIDTH,
      height: 286.817,
      borderRadius: LINED_RADIUS,
    },
  ],
  [
    { x: -224, y: 103.49, rotate: -14.35, ...SCATTERED_SIZE },
    { x: -0.85, y: 6.3, rotate: 8.77, ...GATHERED_SIZE },
    {
      x: 3.87,
      y: 52.79,
      rotate: -2.15,
      width: LINED_WIDTH,
      height: 257.472,
      borderRadius: LINED_RADIUS,
    },
  ],
  [
    { x: 152.8, y: 136.76, rotate: 12.22, ...SCATTERED_SIZE },
    { x: -12.89, y: -8.57, rotate: -2.08, ...GATHERED_SIZE },
    {
      x: 2.44,
      y: 139.89,
      rotate: 0,
      width: LINED_WIDTH,
      height: 290.225,
      borderRadius: LINED_RADIUS,
    },
  ],
];

export function toKeyframes(poses: CardPose[]) {
  return {
    x: poses.map(pose => pose.x),
    y: poses.map(pose => pose.y),
    rotate: poses.map(pose => pose.rotate),
    width: poses.map(pose => pose.width),
    height: poses.map(pose => pose.height),
    borderRadius: poses.map(pose => pose.borderRadius),
  };
}
