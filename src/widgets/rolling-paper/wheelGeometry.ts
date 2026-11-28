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

// 5개 미만이면 순환하지 않고 progress 0~(count-1)에서 멈춘다. 순환하는 원은 5개부터 자연스럽다
export function toWheelOffset(index: number, progress: number, count = WHEEL_ITEM_COUNT) {
  return count >= WHEEL_ITEM_COUNT ? wrapOffset(index, progress, count) : index - progress;
}

export function clampProgress(progress: number, count = WHEEL_ITEM_COUNT) {
  return count >= WHEEL_ITEM_COUNT ? progress : clamp(progress, 0, count - 1);
}

// 중앙 기준 -2.5 ~ 2.5 범위로 접어 5장이 무한히 순환하게 한다
export function wrapOffset(index: number, progress: number, count = WHEEL_ITEM_COUNT) {
  const distance = (((index - progress) % count) + count) % count;
  return distance > count / 2 ? distance - count : distance;
}

// 슬롯은 최대 5개만 그리고 편지는 그보다 많을 수 있다. 가운데에 편지 center가 올 때 slot이 가리키는 편지 번호.
// 슬롯이 -2.5↔2.5로 넘어가는 순간은 투명한 구간이라 편지가 바뀌어도 보이지 않는다
export function toLetterIndex(
  slot: number,
  center: number,
  slotCount: number,
  letterCount: number,
) {
  if (letterCount <= slotCount) return slot;
  const distance = (((slot - center) % slotCount) + slotCount) % slotCount;
  const offset = distance > slotCount / 2 ? distance - slotCount : distance;
  return (((center + offset) % letterCount) + letterCount) % letterCount;
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

// 슬롯은 DOM 순서대로 겹쳐 뒤 슬롯이 가운데 편지지를 덮으므로, 가운데에 가까울수록 위에 쌓는다
export function toCardZIndex(offset: number) {
  return Math.round((WHEEL_ITEM_COUNT - Math.abs(offset)) * 10);
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
