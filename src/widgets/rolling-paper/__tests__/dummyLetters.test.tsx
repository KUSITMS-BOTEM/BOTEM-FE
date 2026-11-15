import { DUMMY_LETTERS } from "@/widgets/rolling-paper/dummyLetters";
import { MAX_CARDS } from "@/widgets/rolling-paper/rollingPaperMotion";

describe("DUMMY_LETTERS", () => {
  it("개수가 카드 슬롯 수와 같아 모든 슬롯에 편지가 있다", () => {
    expect(DUMMY_LETTERS).toHaveLength(MAX_CARDS);
  });

  it("모든 편지에 본문과 보내는 사람 이름이 있다", () => {
    DUMMY_LETTERS.forEach(({ text, senderName }) => {
      expect(text).not.toBe("");
      expect(senderName).not.toBe("");
    });
  });
});
