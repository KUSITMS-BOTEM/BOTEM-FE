import { getFundingCardColor } from "@/utils/funding/getFundingCardColor";

describe("getFundingCardColor", () => {
  it("같은 id는 항상 같은 색을 반환한다", () => {
    expect(getFundingCardColor(7)).toBe(getFundingCardColor(7));
  });

  it("number 1과 string '1'은 같은 색을 반환한다", () => {
    expect(getFundingCardColor(1)).toBe(getFundingCardColor("1"));
  });

  it("결과는 orange, pink, lime, blue 중 하나다", () => {
    expect(["orange", "pink", "lime", "blue"]).toContain(getFundingCardColor("abc-123"));
  });

  it("여러 id를 넣으면 4색이 모두 나온다", () => {
    const colors = new Set(Array.from({ length: 40 }, (_, i) => getFundingCardColor(i + 1)));

    expect([...colors].sort()).toEqual(["blue", "lime", "orange", "pink"]);
  });
});
