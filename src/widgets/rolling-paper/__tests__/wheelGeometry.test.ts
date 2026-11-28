import {
  PX_PER_STEP,
  WHEEL_ITEM_COUNT,
  toCardPose,
  toCardZIndex,
  toProfilePose,
  clampProgress,
  toLetterIndex,
  toSnapTarget,
  toWheelOffset,
  wrapOffset,
} from "@/widgets/rolling-paper/wheelGeometry";

describe("toLetterIndex", () => {
  it("편지가 슬롯 수 이하면 슬롯 번호가 곧 편지 번호다", () => {
    expect(toLetterIndex(3, 2, 5, 5)).toBe(3);
    expect(toLetterIndex(1, 0, 3, 3)).toBe(1);
  });

  it("편지가 슬롯보다 많으면 가운데 편지 기준으로 위아래 편지를 가리킨다", () => {
    // 가운데(슬롯 0)=편지 0, 아래로 1·2, 위로 -2·-1(=끝에서 두 번째·마지막)
    expect([0, 1, 2, 3, 4].map(slot => toLetterIndex(slot, 0, 5, 8))).toEqual([0, 1, 2, 6, 7]);
  });

  it("가운데가 끝 편지를 지나면 처음 편지로 이어진다", () => {
    expect([0, 1, 2, 3, 4].map(slot => toLetterIndex(slot, 7, 5, 8))).toEqual([5, 6, 7, 0, 1]);
  });

  it("가운데 슬롯이 항상 가운데 편지를 가리킨다", () => {
    for (let center = -12; center <= 12; center += 1) {
      const slot = ((center % 5) + 5) % 5;
      expect(toLetterIndex(slot, center, 5, 8)).toBe(((center % 8) + 8) % 8);
    }
  });
});

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

describe("toCardZIndex", () => {
  it("가운데 편지지가 위·아래 편지지보다 위에 쌓인다", () => {
    expect(toCardZIndex(0)).toBeGreaterThan(toCardZIndex(1));
    expect(toCardZIndex(0)).toBeGreaterThan(toCardZIndex(-1));
    expect(toCardZIndex(1)).toBeGreaterThan(toCardZIndex(2));
  });

  it("드래그 중에도 가운데에 더 가까운 편지지가 위에 온다", () => {
    expect(toCardZIndex(0.4)).toBeGreaterThan(toCardZIndex(-0.6));
  });
});
