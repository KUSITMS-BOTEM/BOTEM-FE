import { STICKERS } from "@/widgets/letter-paper/stickers";

describe("STICKERS", () => {
  it("스크롤 레이아웃 확인용으로 20개이다", () => {
    expect(STICKERS).toHaveLength(20);
  });

  it("모든 id가 중복 없이 유일하다", () => {
    expect(new Set(STICKERS.map(({ id }) => id)).size).toBe(STICKERS.length);
  });

  it("모든 항목에 렌더할 수 있는 Icon 컴포넌트가 있다", () => {
    STICKERS.forEach(({ Icon }) => expect(typeof Icon).toMatch(/function|object/));
  });
});
