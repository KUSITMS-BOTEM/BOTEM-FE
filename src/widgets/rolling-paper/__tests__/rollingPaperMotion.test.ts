import { CARD_POSES, toKeyframes, type CardPose } from "@/widgets/rolling-paper/rollingPaperMotion";

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
