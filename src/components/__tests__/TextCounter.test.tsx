import { render, screen } from "@testing-library/react";

import TextCounter from "@/components/TextCounter";

describe("TextCounter", () => {
  it("현재 글자 수와 '/최대 글자 수'를 함께 표시한다", () => {
    render(<TextCounter length={5} maxLength={20} />);

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("/20")).toBeInTheDocument();
  });

  it("기본 상태에서는 tertiary 글자색이다", () => {
    render(<TextCounter length={5} maxLength={20} />);
    const root = screen.getByText("5").parentElement;

    expect(root).toHaveClass("text-semantic-text-tertiary");
    expect(root).not.toHaveClass("text-semantic-text-danger");
  });

  it("error이면 danger 글자색이다", () => {
    render(<TextCounter length={5} maxLength={20} error />);
    const root = screen.getByText("5").parentElement;

    expect(root).toHaveClass("text-semantic-text-danger");
    expect(root).not.toHaveClass("text-semantic-text-tertiary");
  });

  it("length가 0이어도 0을 표시한다", () => {
    render(<TextCounter length={0} maxLength={20} />);

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("/20")).toBeInTheDocument();
  });

  it("id를 주면 카운터 요소에 그대로 붙는다", () => {
    render(<TextCounter id="field-counter" length={3} maxLength={20} />);

    expect(screen.getByText("3").parentElement).toHaveAttribute("id", "field-counter");
  });
});
