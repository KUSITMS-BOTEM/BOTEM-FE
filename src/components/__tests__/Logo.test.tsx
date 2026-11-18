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

  it("color=gray면 path fill을 회색 토큰으로 덮어쓰고, 기본값이면 원래 색을 유지한다", () => {
    const { rerender } = render(<Logo />);
    expect(screen.getByRole("img")).not.toHaveClass("[&_path]:fill-semantic-text-quaternary");

    rerender(<Logo color="gray" />);
    expect(screen.getByRole("img")).toHaveClass("[&_path]:fill-semantic-text-quaternary");
  });

  it("size=medium이면 작은 간격을 쓴다", () => {
    render(<Logo size="medium" />);

    expect(screen.getByRole("img")).toHaveClass("gap-0.5");
  });

  it("className이 없어도 기본 클래스가 유지된다", () => {
    render(<Logo />);

    expect(screen.getByRole("img")).toHaveClass("flex", "items-center", "gap-1");
  });
});
