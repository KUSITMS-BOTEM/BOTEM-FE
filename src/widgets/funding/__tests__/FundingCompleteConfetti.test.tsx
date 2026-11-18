import { render } from "@testing-library/react";

import FundingCompleteConfetti from "@/widgets/funding/FundingCompleteConfetti";
import { CONFETTI_PIECES } from "@/widgets/funding/confettiPieces";

describe("FundingCompleteConfetti", () => {
  it("장식 요소라 스크린리더에서 숨긴다", () => {
    const { container } = render(<FundingCompleteConfetti />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("CONFETTI_PIECES 개수만큼 조각을 그린다", () => {
    const { container } = render(<FundingCompleteConfetti />);

    expect(container.firstElementChild?.children).toHaveLength(CONFETTI_PIECES.length);
  });
});
