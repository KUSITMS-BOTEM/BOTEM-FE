import {
  formatDeadline,
  formatDeadlineShort,
  formatRevealLabel,
  getTodayDate,
} from "@/utils/funding/formatDeadline";

describe("formatDeadline", () => {
  it("날짜를 연.월.일과 요일로 보여준다", () => {
    expect(formatDeadline("2026-12-25")).toBe("2026.12.25 (금)");
  });

  it("빈 값은 빈 문자열을 돌려준다", () => {
    expect(formatDeadline("")).toBe("");
  });
});

describe("getTodayDate", () => {
  afterEach(() => vi.useRealTimers());

  it("기기 로컬 기준 오늘 날짜를 YYYY-MM-DD로 돌려준다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 11, 23, 30));

    expect(getTodayDate()).toBe("2026-11-11");
  });
});

describe("formatDeadlineShort", () => {
  it("날짜를 'M월 D일' 형식으로 바꾼다", () => {
    expect(formatDeadlineShort("2026-11-13")).toBe("11월 13일");
    expect(formatDeadlineShort("2026-01-05")).toBe("1월 5일");
  });

  it("시각이 붙은 마감일도 날짜 부분만 읽는다", () => {
    expect(formatDeadlineShort("2026-12-31T23:59:59")).toBe("12월 31일");
    expect(formatDeadlineShort("2025-10-13T23:59:59.999999")).toBe("10월 13일");
  });
});

describe("formatRevealLabel", () => {
  it("공개 시각을 'M월 D일 H시' 형식으로 바꾼다", () => {
    expect(formatRevealLabel("2026-10-13T00:00:00")).toBe("10월 13일 0시");
    expect(formatRevealLabel("2026-12-25T09:30:00")).toBe("12월 25일 9시");
  });
});
