import { render, screen } from "@testing-library/react";
import MenuTrailing from "@/widgets/user/MenuTrailing";

describe("MenuTrailing", () => {
  it("label 텍스트와 오른쪽 화살표 아이콘을 함께 보여준다", () => {
    const { container } = render(<MenuTrailing label="8명" />);

    expect(screen.getByText("8명")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("label이 빈 문자열이어도 화살표 아이콘은 보인다", () => {
    const { container } = render(<MenuTrailing label="" />);

    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("className으로 넘긴 클래스가 기본 보조 텍스트 색과 함께 적용된다", () => {
    const { container } = render(<MenuTrailing label="지유" className="opacity-30" />);

    expect(container.firstElementChild).toHaveClass("text-semantic-text-secondary", "opacity-30");
  });
});
