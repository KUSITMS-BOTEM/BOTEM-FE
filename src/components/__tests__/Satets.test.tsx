import { render } from "@testing-library/react";

import Satets from "@/components/Satets";

describe("Satets", () => {
  it("기본 렌더 시 공통 베이스 클래스가 적용된다", () => {
    const { container } = render(<Satets color="black" />);
    const overlay = container.firstChild as HTMLElement;

    expect(overlay.className).toContain("pointer-events-none");
    expect(overlay.className).toContain("absolute");
    expect(overlay.className).toContain("inset-0");
    expect(overlay.className).toContain("opacity-0");
    expect(overlay.className).toContain("transition-opacity");
  });

  it.each([
    ["black", "bg-semantic-fill-neutral"],
    ["white", "bg-semantic-icon-on-fill"],
    ["brand", "bg-semantic-fill-brand"],
    ["danger", "bg-semantic-fill-danger"],
  ] as const)('color="%s"면 지정된 배경 토큰 클래스가 적용된다', (color, backgroundClass) => {
    const { container } = render(<Satets color={color} />);
    const overlay = container.firstChild as HTMLElement;

    expect(overlay.className).toContain(backgroundClass);
  });

  it("className prop이 기존 클래스와 함께 적용된다", () => {
    const { container } = render(<Satets color="black" className="mt-4" />);
    const overlay = container.firstChild as HTMLElement;

    expect(overlay.className).toContain("mt-4");
    expect(overlay.className).toContain("pointer-events-none");
  });
});
