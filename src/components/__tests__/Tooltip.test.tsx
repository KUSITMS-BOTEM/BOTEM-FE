import { render, screen } from "@testing-library/react";

import Tooltip from "@/components/Tooltip";

describe("Tooltip", () => {
  it("children을 말풍선 안에 보여준다", () => {
    render(<Tooltip>나도 보태볼까요?</Tooltip>);

    expect(screen.getByText("나도 보태볼까요?")).toBeInTheDocument();
  });

  it("전달한 className이 루트에 병합된다", () => {
    const { container } = render(<Tooltip className="custom-class">안내</Tooltip>);

    expect(container.firstElementChild).toHaveClass("custom-class", "flex");
  });

  it("direction=up이면 줄바꿈이 있는 문구를 여러 줄로 보여준다", () => {
    render(<Tooltip direction="up">{"첫 줄\n둘째 줄"}</Tooltip>);

    const bubble = screen.getByText(/첫 줄/);
    expect(bubble).toHaveTextContent("첫 줄 둘째 줄", { normalizeWhitespace: true });
    expect(bubble).toHaveClass("whitespace-pre-line");
  });

  it("direction을 주지 않으면 한 줄 말풍선(기본 right)으로 보여준다", () => {
    render(<Tooltip>안내</Tooltip>);

    expect(screen.getByText("안내")).toHaveClass("whitespace-nowrap");
  });
});
