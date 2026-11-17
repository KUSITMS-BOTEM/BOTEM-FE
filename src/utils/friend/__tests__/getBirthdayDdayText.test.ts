import { getBirthdayDdayText } from "@/utils/friend/getBirthdayDdayText";

describe("getBirthdayDdayText", () => {
  it("생일 정보가 없으면(null) undefined를 반환한다", () => {
    expect(getBirthdayDdayText(null)).toBeUndefined();
  });

  it("0일이면 오늘 문구를 반환한다", () => {
    expect(getBirthdayDdayText(0)).toBe("오늘이 생일이에요");
  });

  it("남은 일수가 있으면 'n일 남았어요' 문구를 반환한다", () => {
    expect(getBirthdayDdayText(3)).toBe("생일까지 3일 남았어요");
  });
});
