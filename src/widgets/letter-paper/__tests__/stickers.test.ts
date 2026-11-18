import { STICKERS } from "@/widgets/letter-paper/stickers";

describe("STICKERS", () => {
  it("디자인 시안의 스티커 8개이다", () => {
    expect(STICKERS).toHaveLength(8);
  });

  it("모든 id가 중복 없이 유일하다", () => {
    expect(new Set(STICKERS.map(({ id }) => id)).size).toBe(STICKERS.length);
  });

  it("모든 스티커에 스크린리더용 이름(label)이 있고 서로 겹치지 않는다", () => {
    const labels = STICKERS.map(({ label }) => label);

    labels.forEach(label => expect(label.trim()).not.toBe(""));
    expect(new Set(labels).size).toBe(STICKERS.length);
  });

  it("모든 항목에 렌더할 수 있는 Icon 컴포넌트가 있다", () => {
    STICKERS.forEach(({ Icon }) => expect(typeof Icon).toMatch(/function|object/));
  });
});
