import { useReducedMotion } from "framer-motion";
import { render } from "@testing-library/react";

import HeroMotion from "@/components/effects/hero-motion/HeroMotion";
import { BURST_CONFETTI, SNOW_CONFETTI } from "@/components/effects/hero-motion/heroMotionData";

vi.mock("framer-motion", async importOriginal => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(useReducedMotion).mockReturnValue(false);
});

// 컨페티 조각과 공은 배경색 + size-full을 함께 가진다. 공(rounded-full, opacity-75 없음)은 1개
const CONFETTI_BIT = '[class*="bg-base-"][class*="size-full"]';
const RING = ".rounded-full.border-3, .rounded-full.border-2";
const GLINT = '[class*="star-glint"]';

describe("HeroMotion", () => {
  it("루트가 aria-hidden이다", () => {
    const { container } = render(<HeroMotion />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("className prop이 루트에 병합된다", () => {
    const { container } = render(<HeroMotion className="custom-hero" />);

    expect(container.firstElementChild).toHaveClass("custom-hero", "relative");
  });

  it("모션 감소가 꺼져 있으면 눈·폭죽 컨페티가 데이터 개수만큼 렌더된다", () => {
    const { container } = render(<HeroMotion />);

    const total = SNOW_CONFETTI.length + BURST_CONFETTI.length;
    expect(container.querySelectorAll(CONFETTI_BIT)).toHaveLength(total + 1);
  });

  it("모션 감소가 꺼져 있으면 팝 링 2개가 있다", () => {
    const { container } = render(<HeroMotion />);

    expect(container.querySelectorAll(RING)).toHaveLength(2);
  });

  it("모션 감소가 켜져 있으면 컨페티가 없다", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { container } = render(<HeroMotion />);

    expect(container.querySelectorAll(CONFETTI_BIT)).toHaveLength(0);
  });

  it("모션 감소가 켜져 있으면 링과 반짝임 없이 마크만 남는다", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { container } = render(<HeroMotion />);

    expect(container.querySelectorAll(RING)).toHaveLength(0);
    expect(container.querySelector(GLINT)).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
