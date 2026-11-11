import { render, screen } from "@testing-library/react";
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
  it("API 연결 전에는 임시 펀딩 대신 빈 상태를 보여준다", () => {
    render(<ClosedFundingSheet open onClose={vi.fn()} />);

    expect(screen.getByText("마감된 펀딩이 없어요.")).toBeInTheDocument();
    expect(screen.queryByText("{상품명}")).not.toBeInTheDocument();
  });

  it("닫기 대신 뒤로 가기 버튼이 있고, 누르면 onClose를 호출한다", async () => {
    const onClose = vi.fn();
    render(<ClosedFundingSheet open onClose={onClose} />);

    expect(screen.queryByRole("button", { name: "닫기" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));

    expect(onClose).toHaveBeenCalled();
  });
});
