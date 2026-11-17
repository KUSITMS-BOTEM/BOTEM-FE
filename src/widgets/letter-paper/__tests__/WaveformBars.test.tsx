import { render } from "@testing-library/react";

import WaveformBars from "@/widgets/letter-paper/WaveformBars";

const getBars = (container: HTMLElement) => container.querySelectorAll("span");

describe("WaveformBars", () => {
  it("active가 아니면 막대 5개가 정적 높이로 있고 애니메이션이 없다", () => {
    const { container } = render(<WaveformBars barClassName="bg-black" />);

    const bars = getBars(container);
    expect(bars).toHaveLength(5);
    bars.forEach(bar => {
      expect(bar).toHaveClass("bg-black");
      expect(bar.className).not.toContain("animate-");
    });
  });

  it("active면 모든 막대에 애니메이션과 서로 다른 지연이 붙는다", () => {
    const { container } = render(<WaveformBars active barClassName="bg-black" />);

    const bars = Array.from(getBars(container));
    bars.forEach(bar => expect(bar.className).toContain("animate-[waveform-bar"));
    expect(new Set(bars.map(bar => bar.style.animationDelay)).size).toBeGreaterThan(1);
  });
});
