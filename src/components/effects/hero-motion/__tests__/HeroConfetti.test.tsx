import { render } from "@testing-library/react";

import HeroConfetti from "@/components/effects/hero-motion/HeroConfetti";
import type { HeroParticle } from "@/components/effects/hero-motion/heroMotionTrack";

const base: HeroParticle = { k: "circle", c: "orange", p: "top-2 left-3 size-4" };

describe("HeroConfetti", () => {
  it("위치 클래스 p가 절대 위치 래퍼에 적용된다", () => {
    const { container } = render(<HeroConfetti particle={base} />);

    expect(container.firstElementChild).toHaveClass(
      "absolute",
      "origin-center",
      "top-2",
      "left-3",
      "size-4",
    );
  });

  it("kind=star이면 clip-path가 걸리고 둥근 모양은 아니다", () => {
    const { container } = render(<HeroConfetti particle={{ ...base, k: "star" }} />);
    const bit = container.firstElementChild?.firstElementChild as HTMLElement;

    expect(bit.className).toContain("clip-path");
    expect(bit).not.toHaveClass("rounded-full");
  });

  it("kind=circle이면 둥근 모양에 75% 불투명도가 걸린다", () => {
    const { container } = render(<HeroConfetti particle={base} />);

    expect(container.firstElementChild?.firstElementChild).toHaveClass(
      "rounded-full",
      "opacity-75",
    );
  });

  it("kind=bar이면 작은 둥근 모서리만 있고 불투명도는 걸리지 않는다", () => {
    const { container } = render(<HeroConfetti particle={{ ...base, k: "bar" }} />);
    const bit = container.firstElementChild?.firstElementChild as HTMLElement;

    expect(bit).toHaveClass("rounded-xs");
    expect(bit).not.toHaveClass("opacity-75");
  });

  it.each(["orange", "blue", "lime", "pink"] as const)(
    "color=%s이면 해당 배경색 클래스가 적용된다",
    c => {
      const { container } = render(<HeroConfetti particle={{ ...base, c }} />);

      expect(container.firstElementChild?.firstElementChild).toHaveClass(
        `bg-base-${c}-500`,
        "size-full",
      );
    },
  );

  it("트랙이 없는 입자도 렌더된다", () => {
    const { container } = render(<HeroConfetti particle={base} />);

    expect(container.firstElementChild?.firstElementChild).toBeInTheDocument();
  });
});
