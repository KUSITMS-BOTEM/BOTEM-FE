import { render, screen } from "@testing-library/react";

import type { LetterPaperProps } from "@/widgets/letter-paper/LetterPaper";
import RollingPaperCard from "@/widgets/rolling-paper/RollingPaperCard";
import type { RollingCard } from "@/widgets/rolling-paper/rollingPaperMotion";

const CARD: RollingCard = {
  width: 200,
  height: 240,
  poses: [
    { x: 0, y: 0, rotate: 0 },
    { x: 0, y: 0, rotate: 0 },
    { x: 0, y: 0, rotate: 0 },
  ],
  exit: { dx: 0, dy: 100, start: 0.3, end: 0.7 },
};

const LETTER: LetterPaperProps = { text: "생일 축하해!", senderName: "민지" };

describe("RollingPaperCard", () => {
  it("카드 크기가 스타일로 적용된다", () => {
    const { container } = render(<RollingPaperCard card={CARD} letter={LETTER} />);

    expect(container.firstElementChild).toHaveStyle({ width: "200px", height: "240px" });
  });

  it("편지지 내용을 보여주되 슬롯은 눌리지 않게 막는다", () => {
    const { container } = render(<RollingPaperCard card={CARD} letter={LETTER} />);

    expect(screen.getByText("From. 민지")).toBeInTheDocument();
    expect(container.querySelector("[inert]")).toContainElement(screen.getByText("생일 축하해!"));
  });
});
