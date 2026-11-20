import {
  calcFundingPercent,
  getClosedLabel,
  getFundingProgressMessage,
} from "@/utils/funding/fundingProgress";

describe("calcFundingPercent", () => {
  it("소수점은 내림한다", () => {
    expect(calcFundingPercent(999, 1000)).toBe(99);
  });

  it("100을 넘으면 100으로 제한한다", () => {
    expect(calcFundingPercent(2500, 1000)).toBe(100);
  });

  it("모인 금액이 0이면 0이다", () => {
    expect(calcFundingPercent(0, 1000)).toBe(0);
  });

  it.each([0, -1000])("목표 금액이 %i이면 0으로 나누지 않고 0을 반환한다", target => {
    expect(calcFundingPercent(500, target)).toBe(0);
  });
});

describe("getClosedLabel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-16T03:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const OPEN = { percent: 50, deadline: "2026-11-23" };

  it("기간이 남고 목표 미달이면 null이다", () => {
    expect(getClosedLabel(OPEN)).toBeNull();
  });

  it("마감일이 오늘이면 아직 진행 중이라 null이다", () => {
    expect(getClosedLabel({ ...OPEN, deadline: "2026-11-16" })).toBeNull();
  });

  it("기간이 지났으면 기간 마감이다", () => {
    expect(getClosedLabel({ ...OPEN, deadline: "2026-11-15" })).toBe("기간 마감");
  });

  it("기간이 남아도 목표를 채웠으면 마감이다", () => {
    expect(getClosedLabel({ ...OPEN, percent: 100 })).toBe("마감");
  });

  it("기간이 지나고 목표도 채웠으면 마감이 우선한다", () => {
    expect(getClosedLabel({ ...OPEN, percent: 100, deadline: "2026-11-15" })).toBe("마감");
  });

  it("달성률이 0이면 달성으로 보지 않는다", () => {
    expect(getClosedLabel({ ...OPEN, percent: 0 })).toBeNull();
  });
});

describe("getFundingProgressMessage", () => {
  it.each([
    [0, "첫 보탬을 기다려요."],
    [19, "첫 보탬을 기다려요."],
    [20, "좋은 출발이에요."],
    [39, "좋은 출발이에요."],
    [40, "점점 채워지고 있어요."],
    [59, "점점 채워지고 있어요."],
    [60, "절반이 넘었어요!"],
    [79, "절반이 넘었어요!"],
    [80, "거의 다 모았어요!"],
    [94, "거의 다 모았어요!"],
    [95, "곧 보탬이 완성돼요!"],
    [100, "곧 보탬이 완성돼요!"],
  ])("달성률 %i%이면 '%s'를 반환한다", (percent, message) => {
    expect(getFundingProgressMessage(percent)).toBe(message);
  });
});
