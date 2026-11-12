import { parseDateString, toDateString } from "@/utils/date/dateString";

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
