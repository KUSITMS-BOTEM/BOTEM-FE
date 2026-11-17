import { render, screen } from "@testing-library/react";

import FundingCompleteTitle from "@/widgets/funding/FundingCompleteTitle";

describe("FundingCompleteTitle", () => {
  it("제목을 h1로, 설명을 문단으로 보여준다", () => {
    render(<FundingCompleteTitle title="지유에게 보탬!" description="공유해볼까요?" />);

    expect(screen.getByRole("heading", { level: 1, name: "지유에게 보탬!" })).toBeInTheDocument();
    expect(screen.getByText("공유해볼까요?").tagName).toBe("P");
  });

  it("h1은 하나만 있다", () => {
    render(<FundingCompleteTitle title="제목" description="설명" />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("className을 기본 스타일과 병합해 루트에 적용한다", () => {
    const { container } = render(
      <FundingCompleteTitle title="제목" description="설명" className="custom-class" />,
    );

    expect(container.firstElementChild).toHaveClass("custom-class", "flex", "flex-col");
  });
});
