import { render, screen } from "@testing-library/react";

import FundingCompleteConfetti from "@/widgets/funding/FundingCompleteConfetti";

vi.mock("lottie-react", () => ({
  LottieSvg: ({ src, loop }: { src: string; loop: boolean }) => (
    <div data-testid="lottie" data-src={src} data-loop={String(loop)} />
  ),
}));

describe("FundingCompleteConfetti", () => {
  it("public의 컨페티 로티 파일을 불러온다", () => {
    render(<FundingCompleteConfetti />);

    expect(screen.getByTestId("lottie")).toHaveAttribute(
      "data-src",
      "/lottie/funding-complete-confetti.json",
    );
  });

  it("반복 없이 한 번만 재생한다", () => {
    render(<FundingCompleteConfetti />);

    expect(screen.getByTestId("lottie")).toHaveAttribute("data-loop", "false");
  });
});
