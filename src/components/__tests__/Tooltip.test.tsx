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
});
