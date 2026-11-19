import { getBirthdayReveal } from "@/utils/funding/getBirthdayReveal";

describe("getBirthdayReveal", () => {
  it("생일이 며칠 뒤면 그 날짜를 공개일로 쓰고 사용할 수 있다", () => {
    expect(getBirthdayReveal("2026-11-19", "11-25", 6)).toEqual({
      revealDate: "2026-11-25",
      canUse: true,
    });
  });

  it("생일이 내일이면 마감일이 오늘이라 사용할 수 있다", () => {
    expect(getBirthdayReveal("2026-11-19", "11-20", 1).canUse).toBe(true);
  });

  it("생일이 오늘이면 마감일을 만들 수 없어 사용할 수 없다", () => {
    expect(getBirthdayReveal("2026-11-19", "11-19", 0)).toEqual({
      revealDate: "2026-11-19",
      canUse: false,
    });
  });

  it("생일 정보가 하나라도 없으면 비운다", () => {
    const empty = { revealDate: undefined, canUse: false };
    expect(getBirthdayReveal("2026-11-19", null, 3)).toEqual(empty);
    expect(getBirthdayReveal("2026-11-19", "11-22", null)).toEqual(empty);
  });
});
