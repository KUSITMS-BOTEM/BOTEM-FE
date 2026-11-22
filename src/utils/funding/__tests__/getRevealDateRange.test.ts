import { getRevealDateRange } from "@/utils/funding/getRevealDateRange";

describe("getRevealDateRange", () => {
  it("마감일 다음 날부터 30일 뒤까지를 돌려준다", () => {
    expect(getRevealDateRange("2027-12-25")).toEqual({
      minDate: "2027-12-26",
      maxDate: "2028-01-24",
    });
  });

  it("월 경계를 넘어도 날짜를 올바르게 계산한다", () => {
    expect(getRevealDateRange("2027-02-10")).toEqual({
      minDate: "2027-02-11",
      maxDate: "2027-03-12",
    });
  });
});
