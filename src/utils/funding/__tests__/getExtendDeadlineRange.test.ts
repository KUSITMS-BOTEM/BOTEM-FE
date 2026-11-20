import { getExtendDeadlineRange } from "@/utils/funding/getExtendDeadlineRange";

describe("getExtendDeadlineRange", () => {
  it("마감 당일에 열면 다음 날부터 오늘+14일까지 고를 수 있다", () => {
    expect(getExtendDeadlineRange("2026-10-13", "2026-10-13")).toEqual({
      minDate: "2026-10-14",
      maxDate: "2026-10-27",
    });
  });

  it("마감일이 며칠 지난 뒤 열면 지난 날짜는 빼고 오늘부터, 오늘 기준 14일까지 고를 수 있다", () => {
    expect(getExtendDeadlineRange("2026-10-05", "2026-10-13")).toEqual({
      minDate: "2026-10-13",
      maxDate: "2026-10-27",
    });
  });
});
