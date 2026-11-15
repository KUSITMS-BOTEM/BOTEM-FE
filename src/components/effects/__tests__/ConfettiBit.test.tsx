import { render } from "@testing-library/react";

import ConfettiBit from "@/components/effects/ConfettiBit";

describe("ConfettiBit", () => {
  it("circle이면 둥근 모양에 75% 불투명도가 걸린다", () => {
    const { container } = render(<ConfettiBit kind="circle" />);

    expect(container.firstElementChild).toHaveClass("rounded-full", "opacity-75");
  });

  it("star이면 clip-path가 걸리고 둥근 모서리는 없다", () => {
    const { container } = render(<ConfettiBit kind="star" />);
    const root = container.firstElementChild as HTMLElement;

    expect(root.className).toContain("clip-path");
    expect(root).not.toHaveClass("rounded-full");
  });

  it("bar이면 작은 둥근 모서리만 있고 불투명도는 걸리지 않는다", () => {
    const { container } = render(<ConfettiBit kind="bar" />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass("rounded-xs");
    expect(root).not.toHaveClass("opacity-75");
  });

  it("className prop이 루트에 적용된다", () => {
    const { container } = render(<ConfettiBit kind="circle" className="bg-base-pink-500 size-2" />);

    expect(container.firstElementChild).toHaveClass("size-2", "bg-base-pink-500");
  });
});
