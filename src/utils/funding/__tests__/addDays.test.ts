import { addDays } from "@/utils/funding/addDays";

describe("addDays", () => {
  it.each([
    ["2026-10-13", 7, "2026-10-20"],
    ["2026-10-25", 14, "2026-11-08"],
    ["2026-12-25", 14, "2027-01-08"],
    ["2028-02-28", 1, "2028-02-29"],
    ["2026-10-13", 0, "2026-10-13"],
  ])("%s에 %i일을 더하면 %s", (date, days, expected) => {
    expect(addDays(date, days)).toBe(expected);
  });
});
