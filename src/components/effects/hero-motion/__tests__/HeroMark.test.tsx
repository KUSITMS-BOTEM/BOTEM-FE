import { render } from "@testing-library/react";

import HeroMark from "@/components/effects/hero-motion/HeroMark";

const GLINT = '[class*="star-glint"]';

describe("HeroMark", () => {
  it("playing=true이면 반짝임 마스크 래퍼가 있다", () => {
    const { container } = render(<HeroMark playing />);

    expect(container.querySelector(GLINT)).toBeInTheDocument();
  });

  it("playing=false이면 반짝임 마스크 래퍼가 없다", () => {
    const { container } = render(<HeroMark playing={false} />);

    expect(container.querySelector(GLINT)).not.toBeInTheDocument();
  });

  it("playing=false여도 마크 루트는 렌더된다", () => {
    const { container } = render(<HeroMark playing={false} />);

    expect(container.firstElementChild).toHaveClass("absolute", "origin-center");
  });
});
