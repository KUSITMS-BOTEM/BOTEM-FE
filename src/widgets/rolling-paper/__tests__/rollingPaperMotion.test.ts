import {
  CARD_TRANSITION,
  ROLLING_CARDS,
  START_OPACITY,
  START_SCALE,
  getVisibleCards,
  toKeyframes,
  type CardPose,
  type RollingCard,
} from "@/widgets/rolling-paper/rollingPaperMotion";

const startX = (cards: RollingCard[]) => cards.map(({ poses }) => poses[0].x);
const linedCenterY = (cards: RollingCard[]) => {
  const top = Math.min(...cards.map(({ poses, height }) => poses[2].y - height / 2));
  const bottom = Math.max(...cards.map(({ poses, height }) => poses[2].y + height / 2));
  return (top + bottom) / 2;
};

describe("getVisibleCards", () => {
  it("5장 이상이면 5장 전부를 원래 포즈 그대로 돌려준다", () => {
    expect(getVisibleCards(5)).toEqual(ROLLING_CARDS);
    expect(getVisibleCards(8)).toEqual(ROLLING_CARDS);
  });

  it("1장이면 우측 상단 카드만 남긴다", () => {
    expect(startX(getVisibleCards(1))).toEqual([300]);
  });

  it("2장이면 우측 상단과 좌측 하단 카드를 쌓임 순서대로 남긴다", () => {
    expect(startX(getVisibleCards(2))).toEqual([300, -224]);
  });

  it("3장이면 우측 하단이, 4장이면 좌측 상단이 차례로 추가된다", () => {
    expect(startX(getVisibleCards(3))).toEqual([300, -224, 153]);
    expect(startX(getVisibleCards(4))).toEqual([-66, 300, -224, 153]);
  });

  it("카드가 줄어도 일렬 단계의 세로 중심은 5장일 때와 같다", () => {
    [1, 2, 3, 4].forEach(count => {
      expect(linedCenterY(getVisibleCards(count))).toBeCloseTo(linedCenterY(ROLLING_CARDS));
    });
  });

  it("시작·모임 단계는 보정하지 않는다", () => {
    const [{ poses }] = getVisibleCards(1);

    expect(poses[0]).toEqual(ROLLING_CARDS[2].poses[0]);
    expect(poses[1]).toEqual(ROLLING_CARDS[2].poses[1]);
  });
});

describe("toKeyframes", () => {
  const poses: CardPose[] = [
    { x: 1, y: 2, rotate: 3 },
    { x: 10, y: 20, rotate: 30 },
    { x: 100, y: 200, rotate: 300 },
  ];

  it("대기·쉼 구간을 위해 시작·모임 포즈를 두 번씩 둔다", () => {
    const keyframes = toKeyframes(poses);

    expect(keyframes.x).toEqual([1, 1, 10, 10, 100]);
    expect(keyframes.y).toEqual([2, 2, 20, 20, 200]);
    expect(keyframes.rotate).toEqual([3, 3, 30, 30, 300]);
  });

  it("시작은 작고 반투명하며 모임부터 원래 크기·불투명으로 돌아온다", () => {
    const { scale, opacity } = toKeyframes(poses);

    expect(scale).toEqual([START_SCALE, START_SCALE, 1, 1, 1]);
    expect(opacity).toEqual([START_OPACITY, START_OPACITY, 1, 1, 1]);
  });
});

describe("CARD_TRANSITION", () => {
  it("대기 0.1s·모임 0.7s·쉼 1.2s·펼침 1.65s 지점에 keyframe이 놓인다", () => {
    const { duration, times } = CARD_TRANSITION.x;

    expect(duration).toBe(1.65);
    [0, 0.1, 0.7, 1.2, 1.65].forEach((seconds, index) => {
      expect(times[index] * duration).toBeCloseTo(seconds);
    });
  });

  it("값마다 구간 수(4)와 같은 개수의 이징을 가진다", () => {
    Object.values(CARD_TRANSITION).forEach(({ ease }) => expect(ease).toHaveLength(4));
  });
});

describe("ROLLING_CARDS", () => {
  it("편지지 5장이 각각 시작·모임·일렬 3개 포즈를 가진다", () => {
    expect(ROLLING_CARDS).toHaveLength(5);
    ROLLING_CARDS.forEach(({ poses }) => expect(poses).toHaveLength(3));
  });

  it("모든 카드가 같은 폭을 가진다", () => {
    ROLLING_CARDS.forEach(card => expect(card.width).toBe(250.768));
  });
});
