import { render } from "@testing-library/react";

import VoiceMessage from "@/widgets/letter-paper/VoiceMessage";
import type { Color } from "@/constants/color";

const getBars = (container: HTMLElement) => Array.from(container.querySelectorAll("span"));

describe("VoiceMessage", () => {
  it("color를 지정하지 않으면 파형 막대가 pink다", () => {
    const { container } = render(<VoiceMessage />);

    const bars = getBars(container);
    expect(bars).toHaveLength(5);
    bars.forEach(bar => expect(bar).toHaveClass("bg-base-pink-500"));
  });

  it.each<[Color, string]>([
    ["orange", "bg-base-orange-500"],
    ["pink", "bg-base-pink-500"],
    ["lime", "bg-base-lime-500"],
    ["blue", "bg-base-blue-500"],
  ])("color가 %s이면 파형 막대 5개가 모두 %s다", (color, bgClass) => {
    const { container } = render(<VoiceMessage color={color} />);

    const bars = getBars(container);
    expect(bars).toHaveLength(5);
    bars.forEach(bar => expect(bar).toHaveClass(bgClass));
  });

  it("파형 막대 높이가 8·14·22·18·8px 순서다", () => {
    const { container } = render(<VoiceMessage />);

    const heights = ["h-2", "h-3.5", "h-[22px]", "h-[18px]", "h-2"];
    getBars(container).forEach((bar, index) => expect(bar).toHaveClass(heights[index]));
  });

  it("className을 넘기면 루트에 병합되고 기본 클래스는 유지된다", () => {
    const { container } = render(<VoiceMessage className="mt-4" />);

    expect(container.firstElementChild).toHaveClass("mt-4", "rounded-full");
  });
});
