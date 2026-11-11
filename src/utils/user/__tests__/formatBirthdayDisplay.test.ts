import { formatBirthdayDisplay } from "@/utils/user/formatBirthdayDisplay";

describe("formatBirthdayDisplay", () => {
  it("'MM-DD'를 'M월 D일'로 바꾼다", () => {
    expect(formatBirthdayDisplay("10-13")).toBe("10월 13일");
  });

  it("월·일의 앞자리 0은 떼고 표시한다", () => {
    expect(formatBirthdayDisplay("01-05")).toBe("1월 5일");
  });
});
