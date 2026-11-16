import { fireEvent, render, screen } from "@testing-library/react";

import BotemPopupRow from "@/widgets/funding/BotemPopupRow";

const BASE = {
  icon: <svg data-testid="icon" />,
  title: "내 보탬 수정하기",
  description: "마감일까지 수정할 수 있어요",
};

describe("BotemPopupRow", () => {
  it("onClick이 있으면 button으로 렌더되고 클릭하면 onClick이 호출된다", () => {
    const onClick = vi.fn();
    render(<BotemPopupRow {...BASE} onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", { name: /내 보탬 수정하기/ }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("onClick이 없으면 button이 아니고 제목과 설명만 보여준다", () => {
    render(<BotemPopupRow {...BASE} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("내 보탬 수정하기")).toBeInTheDocument();
    expect(screen.getByText("마감일까지 수정할 수 있어요")).toBeInTheDocument();
  });

  it("highlighted면 제목이 danger 색이고, 아니면 primary 색이다", () => {
    const { rerender } = render(<BotemPopupRow {...BASE} highlighted />);
    expect(screen.getByText("내 보탬 수정하기")).toHaveClass("text-semantic-text-danger");

    rerender(<BotemPopupRow {...BASE} />);
    expect(screen.getByText("내 보탬 수정하기")).toHaveClass("text-semantic-text-primary");
  });
});
