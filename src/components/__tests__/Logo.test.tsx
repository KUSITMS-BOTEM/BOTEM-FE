import { render, screen } from "@testing-library/react";

import Logo from "@/components/Logo";

describe("Logo", () => {
  it("role=img이고 접근 가능한 이름이 보탬이다", () => {
    render(<Logo />);

    expect(screen.getByRole("img", { name: "보탬" })).toBeInTheDocument();
  });

  it("내부 svg는 모두 스크린리더에서 숨겨진다", () => {
    const { container } = render(<Logo />);
    const svgs = container.querySelectorAll("svg");

    expect(svgs.length).toBeGreaterThan(0);
    svgs.forEach(svg => expect(svg).toHaveAttribute("aria-hidden", "true"));
  });

  it("className이 기본 클래스와 병합된다", () => {
    render(<Logo className="custom-logo" />);

    expect(screen.getByRole("img")).toHaveClass("flex", "items-center", "gap-1", "custom-logo");
  });

  it("className이 없어도 기본 클래스가 유지된다", () => {
    render(<Logo />);

    expect(screen.getByRole("img")).toHaveClass("flex", "items-center", "gap-1");
  });
});
