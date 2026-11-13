// 도착 화면의 휠. 편지지와 프로필이 같은 progress(중앙에 오는 아이템 번호, 실수)를 공유해 함께 움직인다.
// 좌표는 도착 화면 중심 기준 오프셋(px)이고, 디자인(360×812) 스크린샷에서 역산한 근사값이다.
// shortcut: 휠 중심·반지름·간격은 Figma 메타데이터 없이 스크린샷으로 맞춘 값, 디자인 수치가 확정되면 교체
export const WHEEL_ITEM_COUNT = 5;

const STEP_RAD = (24 * Math.PI) / 180;
const CARD_WHEEL = { centerX: 557, radius: 587 };
const PROFILE_WHEEL = { centerX: 282, radius: 152 };
const CARD_ROTATE_PER_STEP = 16;
const SIDE_CARD_SCALE = 0.764;
const SIDE_CARD_OPACITY = 0.71;
const SIDE_PROFILE_SCALE = 0.72;
const SIDE_PROFILE_OPACITY = 0.8;
// 이웃 카드 간 세로 간격. 드래그 거리를 progress로 바꾸는 기준이다
export const PX_PER_STEP = Math.round(CARD_WHEEL.radius * Math.sin(STEP_RAD));
// 손을 뗀 뒤 속도(step/s)를 얼마나 앞서 스냅할지(초)
const INERTIA_SECONDS = 0.12;

export type WheelPose = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  opacity: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// 중앙 기준 -2.5 ~ 2.5 범위로 접어 5장이 무한히 순환하게 한다
export function wrapOffset(index: number, progress: number, count = WHEEL_ITEM_COUNT) {
  const distance = (((index - progress) % count) + count) % count;
  return distance > count / 2 ? distance - count : distance;
}

// 중앙에서 한 칸 이상 멀어지면 같은 값으로 고정되는 0~1 거리
const sideRatio = (offset: number) => Math.min(Math.abs(offset), 1);

export function toCardPose(offset: number): WheelPose {
  const angle = offset * STEP_RAD;
  const side = sideRatio(offset);
  // 화면 밖(두 칸 이상)에서 값이 튀지 않도록 1.6~2.2 구간에서 투명해진다
  const fadeOut = clamp((2.2 - Math.abs(offset)) / 0.6, 0, 1);

  return {
    x: CARD_WHEEL.centerX - CARD_WHEEL.radius * Math.cos(angle),
    y: CARD_WHEEL.radius * Math.sin(angle),
    rotate: offset * CARD_ROTATE_PER_STEP,
    scale: 1 - (1 - SIDE_CARD_SCALE) * side,
    opacity: (1 - (1 - SIDE_CARD_OPACITY) * side) * fadeOut,
  };
}

export function toProfilePose(offset: number): WheelPose {
  const angle = offset * STEP_RAD;
  const side = sideRatio(offset);

  return {
    x: PROFILE_WHEEL.centerX - PROFILE_WHEEL.radius * Math.cos(angle),
    y: PROFILE_WHEEL.radius * Math.sin(angle),
    rotate: 0,
    scale: 1 - (1 - SIDE_PROFILE_SCALE) * side,
    opacity: 1 - (1 - SIDE_PROFILE_OPACITY) * side,
  };
}

export function toTransform({ x, y, rotate, scale }: WheelPose) {
  return `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`;
}

// 손을 뗄 때 멈출 아이템 번호. 속도(step/s)만큼 앞서 가장 가까운 정수로 맞춘다
export function toSnapTarget(progress: number, velocity: number) {
  return Math.round(progress + velocity * INERTIA_SECONDS);
}
