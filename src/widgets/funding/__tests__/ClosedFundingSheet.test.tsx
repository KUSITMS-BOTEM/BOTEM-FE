import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ClosedFundingSheet from "@/widgets/funding/ClosedFundingSheet";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

describe("ClosedFundingSheet", () => {
  it("마감일 헤더별로 펀딩 카드를 묶어 보여준다", () => {
    render(<ClosedFundingSheet open onClose={vi.fn()} />);

    const sections = screen
      .getAllByRole("heading", { level: 2 })
      .map(heading => heading.closest("section")!);

    expect(within(sections[0]).getByRole("heading")).toHaveTextContent("2025.10.13");
    expect(within(sections[0]).getAllByText("{상품명}")).toHaveLength(1);
    expect(within(sections[1]).getByRole("heading")).toHaveTextContent("2025.10.10");
    expect(within(sections[1]).getAllByText("{상품명}")).toHaveLength(2);
  });

  it("닫기 대신 뒤로 가기 버튼이 있고, 누르면 onClose를 호출한다", async () => {
    const onClose = vi.fn();
    render(<ClosedFundingSheet open onClose={onClose} />);

    expect(screen.queryByRole("button", { name: "닫기" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));

    expect(onClose).toHaveBeenCalled();
  });
});
