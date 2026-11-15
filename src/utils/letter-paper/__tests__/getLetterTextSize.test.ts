import { getLetterTextSize } from "@/utils/letter-paper/getLetterTextSize";

describe("getLetterTextSize", () => {
  it("110자 이하면 large다", () => {
    expect(getLetterTextSize("가".repeat(110))).toBe("large");
  });

  it("111자부터는 길이가 아무리 길어도 small이다", () => {
    expect(getLetterTextSize("가".repeat(111))).toBe("small");
    expect(getLetterTextSize("가".repeat(500))).toBe("small");
  });

  it("이모지 같은 서로게이트 쌍은 글자 하나로 센다", () => {
    expect(getLetterTextSize("😀".repeat(110))).toBe("large");
    expect(getLetterTextSize("😀".repeat(111))).toBe("small");
  });

  it("빈 문자열은 large다", () => {
    expect(getLetterTextSize("")).toBe("large");
  });
});
