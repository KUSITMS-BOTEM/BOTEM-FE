import { getDDayLabel, isDeadlinePassed } from "@/utils/funding/getDDayLabel";

describe("getDDayLabel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-16T03:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("7일 뒤 마감이면 D-7을 반환한다", () => {
    expect(getDDayLabel("2026-11-23")).toBe("D-7");
  });

  it("마감일이 오늘이면 D-Day를 반환한다", () => {
    expect(getDDayLabel("2026-11-16")).toBe("D-Day");
  });

  it("마감일이 어제면 D-0을 반환한다", () => {
    expect(getDDayLabel("2026-11-15")).toBe("D-0");
  });

  it("날짜 형식이 틀리면 빈 문자열을 반환한다", () => {
    expect(getDDayLabel("")).toBe("");
    expect(getDDayLabel("2026-02-31")).toBe("");
  });

  it("서버 시간대(UTC)가 아직 전날이어도 서울 날짜 기준으로 계산한다", () => {
    // UTC 2026-11-15 20:00 = 서울 2026-11-16 05:00
    vi.setSystemTime(new Date("2026-11-15T20:00:00Z"));

    expect(getDDayLabel("2026-11-16")).toBe("D-Day");
    expect(getDDayLabel("2026-11-23")).toBe("D-7");
  });
});

describe("isDeadlinePassed", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-16T03:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("마감일이 어제면 true", () => {
    expect(isDeadlinePassed("2026-11-15")).toBe(true);
  });

  it("마감일이 오늘이면 아직 지나지 않았으므로 false", () => {
    expect(isDeadlinePassed("2026-11-16")).toBe(false);
  });

  it("날짜 형식이 틀리면 false", () => {
    expect(isDeadlinePassed("")).toBe(false);
  });
});
