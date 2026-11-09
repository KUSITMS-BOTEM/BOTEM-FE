import { render } from "@testing-library/react";

import GiftAnimation from "@/components/effects/GiftAnimation";

describe("GiftAnimation", () => {
  it("루트가 aria-hidden이다", () => {
    const { container } = render(<GiftAnimation variant="wiggle" />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("className prop이 루트에 적용된다", () => {
    const { container } = render(<GiftAnimation variant="open" className="custom-gift" />);

    expect(container.firstElementChild).toHaveClass("custom-gift");
  });

  it("wiggle이면 confetti 입자가 없다", () => {
    const { container } = render(<GiftAnimation variant="wiggle" />);

    const root = container.firstElementChild as HTMLElement;
    const particles = Array.from(root.children).filter(
      el =>
        el.classList.contains("bg-base-orange-500") ||
        el.classList.contains("bg-base-blue-500") ||
        el.classList.contains("bg-base-lime-500"),
    );
    expect(particles).toHaveLength(0);
  });

  it("open이면 confetti 입자 12개를 렌더한다", () => {
    const { container } = render(<GiftAnimation variant="open" />);

    const root = container.firstElementChild as HTMLElement;
    const particles = Array.from(root.children).filter(
      el =>
        el.classList.contains("bg-base-orange-500") ||
        el.classList.contains("bg-base-blue-500") ||
        el.classList.contains("bg-base-lime-500"),
    );
    expect(particles).toHaveLength(12);
  });
});
