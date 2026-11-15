import {
  PX_PER_STEP,
  WHEEL_ITEM_COUNT,
  toCardPose,
  toProfilePose,
  clampProgress,
  toSnapTarget,
  toWheelOffset,
  wrapOffset,
} from "@/widgets/rolling-paper/wheelGeometry";

describe("wrapOffset", () => {
  it("progress와 같은 번호의 아이템이 중앙(0)에 온다", () => {
    expect(wrapOffset(2, 2)).toBe(0);
  });

  it("끝 번호를 지나면 처음 아이템이 이어서 나온다", () => {
    expect(wrapOffset(0, 4)).toBe(1);
    expect(wrapOffset(4, 0)).toBe(-1);
  });

  it("모든 아이템의 오프셋이 -2.5 초과 2.5 이하로 접힌다", () => {
    for (let progress = -12; progress <= 12; progress += 0.37) {
      for (let index = 0; index < WHEEL_ITEM_COUNT; index += 1) {
        const offset = wrapOffset(index, progress);
        expect(offset).toBeGreaterThan(-2.5 - 1e-9);
        expect(offset).toBeLessThanOrEqual(2.5 + 1e-9);
      }
    }
  });
});

describe("toCardPose·toProfilePose", () => {
  it("중앙 카드는 회전 없이 원래 크기로 보인다", () => {
    expect(toCardPose(0)).toMatchObject({ rotate: 0, scale: 1, opacity: 1 });
  });

  it("위·아래 이웃은 서로 반대로 기울고 y 방향이 반대다", () => {
    const above = toCardPose(-1);
    const below = toCardPose(1);

    expect(above.rotate).toBe(-below.rotate);
    expect(above.y).toBeCloseTo(-below.y);
    expect(above.x).toBeCloseTo(below.x);
  });

  it("이웃 카드는 중앙보다 작고 흐리다", () => {
    const side = toCardPose(1);

    expect(side.scale).toBeLessThan(1);
    expect(side.opacity).toBeLessThan(1);
  });

  it("두 칸 이상 멀어진 카드는 화면에서 사라진다", () => {
    expect(toCardPose(2.5).opacity).toBe(0);
  });

  it("프로필은 중앙에서 가장 크고 가장자리로 갈수록 오른쪽으로 밀린다", () => {
    expect(toProfilePose(0).scale).toBe(1);
    expect(toProfilePose(1).x).toBeGreaterThan(toProfilePose(0).x);
    expect(toProfilePose(2).x).toBeGreaterThan(toProfilePose(1).x);
  });

  it("카드와 프로필의 y는 같은 방향으로 움직인다", () => {
    expect(Math.sign(toCardPose(1).y)).toBe(Math.sign(toProfilePose(1).y));
  });
});

describe("toSnapTarget", () => {
  it("속도가 없으면 가장 가까운 정수로 맞춘다", () => {
    expect(toSnapTarget(1.4, 0)).toBe(1);
    expect(toSnapTarget(1.6, 0)).toBe(2);
  });

  it("빠르게 던지면 진행 방향으로 더 나아간다", () => {
    expect(toSnapTarget(1.4, 5)).toBe(2);
    expect(toSnapTarget(1.6, -5)).toBe(1);
  });
});

describe("PX_PER_STEP", () => {
  it("한 칸 거리가 카드 한 장 높이 안쪽인 양수다", () => {
    expect(PX_PER_STEP).toBeGreaterThan(0);
    expect(PX_PER_STEP).toBeLessThan(272);
  });
});

describe("toWheelOffset·clampProgress", () => {
  it("5개 이상이면 순환하고 progress를 제한하지 않는다", () => {
    expect(toWheelOffset(0, 4, 5)).toBe(1);
    expect(clampProgress(7, 5)).toBe(7);
  });

  it("5개 미만이면 순환하지 않고 0~(count-1)로 제한한다", () => {
    expect(toWheelOffset(0, 1, 3)).toBe(-1);
    expect(toWheelOffset(2, 0, 3)).toBe(2);
    expect(clampProgress(-0.5, 3)).toBe(0);
    expect(clampProgress(2.6, 3)).toBe(2);
    expect(clampProgress(1.4, 1)).toBe(0);
  });
});
