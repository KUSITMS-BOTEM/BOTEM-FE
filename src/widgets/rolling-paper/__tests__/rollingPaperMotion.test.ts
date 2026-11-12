import {
  CARD_POSES,
  getVisiblePoses,
  toKeyframes,
  type CardPose,
} from "@/widgets/rolling-paper/rollingPaperMotion";

const scatteredX = (cards: CardPose[][]) => cards.map(poses => poses[0].x);
const linedCenterY = (cards: CardPose[][]) => {
  const top = Math.min(...cards.map(([, , lined]) => lined.y - lined.height / 2));
  const bottom = Math.max(...cards.map(([, , lined]) => lined.y + lined.height / 2));
  return (top + bottom) / 2;
};

describe("getVisiblePoses", () => {
  it("5장 이상이면 5장 전부를 원래 포즈 그대로 돌려준다", () => {
    expect(getVisiblePoses(5)).toEqual(CARD_POSES);
    expect(getVisiblePoses(8)).toEqual(CARD_POSES);
  });

  it("1장이면 우측 상단 카드만 남긴다", () => {
    expect(scatteredX(getVisiblePoses(1))).toEqual([164]);
  });

  it("2장이면 우측 상단과 좌측 하단 카드를 쌓임 순서대로 남긴다", () => {
    expect(scatteredX(getVisiblePoses(2))).toEqual([164, -224]);
  });

  it("3장이면 우측 하단이, 4장이면 좌측 상단이 차례로 추가된다", () => {
    expect(scatteredX(getVisiblePoses(3))).toEqual([164, -224, 152.8]);
    expect(scatteredX(getVisiblePoses(4))).toEqual([-191.2, 164, -224, 152.8]);
  });

  it("카드가 줄어도 일렬 단계의 세로 중심은 5장일 때와 같다", () => {
    [1, 2, 3, 4].forEach(count => {
      expect(linedCenterY(getVisiblePoses(count))).toBeCloseTo(linedCenterY(CARD_POSES));
    });
  });

  it("흩어짐·모임 단계는 보정하지 않는다", () => {
    const [poses] = getVisiblePoses(1);

    expect(poses[0]).toEqual(CARD_POSES[2][0]);
    expect(poses[1]).toEqual(CARD_POSES[2][1]);
  });
});

describe("toKeyframes", () => {
  it("포즈 배열을 속성별 값 배열로 바꾼다", () => {
    const poses: CardPose[] = [
      { x: 1, y: 2, rotate: 3, width: 4, height: 5, borderRadius: 6 },
      { x: 10, y: 20, rotate: 30, width: 40, height: 50, borderRadius: 60 },
    ];

    expect(toKeyframes(poses)).toEqual({
      x: [1, 10],
      y: [2, 20],
      rotate: [3, 30],
      width: [4, 40],
      height: [5, 50],
      borderRadius: [6, 60],
    });
  });
});

describe("CARD_POSES", () => {
  it("편지지 5장이 각각 흩어짐·모임·일렬 3단계를 가진다", () => {
    expect(CARD_POSES).toHaveLength(5);
    CARD_POSES.forEach(poses => expect(poses).toHaveLength(3));
  });

  it("모든 카드가 흩어짐 단계에서 작게 시작해 일렬 단계에서 같은 폭으로 끝난다", () => {
    CARD_POSES.forEach(poses => {
      expect(poses[0].width).toBe(132.199);
      expect(poses[2].width).toBe(250.768);
    });
  });
});
