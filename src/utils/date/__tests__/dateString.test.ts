import { clampDate, getDaysInMonth, parseDateString, toDateString } from "@/utils/date/dateString";

describe("toDateString", () => {
  it("로컬 날짜를 YYYY-MM-DD로 만들고 한 자리 월·일은 0으로 채운다", () => {
    expect(toDateString(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("로컬 자정 기준이라 시간대와 상관없이 같은 날짜가 나온다", () => {
    expect(toDateString(new Date(2026, 11, 31, 23, 59))).toBe("2026-12-31");
  });
});

describe("parseDateString", () => {
  it("YYYY-MM-DD를 로컬 날짜로 파싱한다", () => {
    const date = parseDateString("2026-11-20");

    expect([date?.getFullYear(), date?.getMonth(), date?.getDate()]).toEqual([2026, 10, 20]);
  });

  it("toDateString과 서로 되돌릴 수 있다", () => {
    expect(toDateString(parseDateString("2000-02-29")!)).toBe("2000-02-29");
  });

  it("빈 문자열이나 형식이 틀린 값은 undefined를 돌려준다", () => {
    expect(parseDateString("")).toBeUndefined();
    expect(parseDateString("abc")).toBeUndefined();
  });
});

describe("getDaysInMonth", () => {
  it("윤년 여부에 따라 2월 일수가 달라진다", () => {
    expect(getDaysInMonth(2000, 2)).toBe(29);
    expect(getDaysInMonth(2027, 2)).toBe(28);
  });

  it("31일·30일인 달을 구분한다", () => {
    expect(getDaysInMonth(2026, 12)).toBe(31);
    expect(getDaysInMonth(2026, 11)).toBe(30);
  });
});

describe("clampDate", () => {
  it("없는 날은 그 달 말일로 맞춘다", () => {
    expect(toDateString(clampDate(2027, 2, 31))).toBe("2027-02-28");
  });

  it("min보다 이르면 min으로 올리고, 같거나 늦으면 그대로 둔다", () => {
    const min = new Date(2026, 10, 13);

    expect(toDateString(clampDate(2026, 11, 5, min))).toBe("2026-11-13");
    expect(toDateString(clampDate(2026, 11, 13, min))).toBe("2026-11-13");
    expect(toDateString(clampDate(2027, 1, 1, min))).toBe("2027-01-01");
  });
});
