import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FundingExtendSheet from "@/widgets/funding/FundingExtendSheet";

// jsdom은 HTMLDialogElement의 showModal/close를 구현하지 않아 open 속성만 토글하도록 대체한다
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

const renderSheet = () => {
  const onExtend = vi.fn();
  const { container } = render(
    <FundingExtendSheet
      open
      collectedAmount={301000}
      currentDeadline="2026-10-13"
      onExtend={onExtend}
      onClose={vi.fn()}
    />,
  );
  const dateInput = container.ownerDocument.querySelector('input[type="date"]')!;
  return { onExtend, dateInput };
};

describe("FundingExtendSheet", () => {
  it("모인 금액과 기존 마감일 안내를 보여준다", () => {
    renderSheet();

    expect(screen.getByText(/지금까지 모인 301,000원은 그대로 두고/)).toBeInTheDocument();
    expect(screen.getByText("기존 마감일은 10월 13일까지에요")).toBeInTheDocument();
    expect(screen.getByText("최대 14일까지 더 연장할 수 있어요")).toBeInTheDocument();
  });

  it("날짜를 고르기 전에는 '연장하기'가 비활성화된다", () => {
    renderSheet();

    expect(screen.getByRole("button", { name: "연장하기" })).toBeDisabled();
  });

  it("기존 마감일 다음 날부터 14일 뒤까지만 고를 수 있다", () => {
    const { dateInput } = renderSheet();

    expect(dateInput).toHaveAttribute("min", "2026-10-14");
    expect(dateInput).toHaveAttribute("max", "2026-10-27");
  });

  it("날짜를 고르면 'M월 D일'로 보여주고, 연장하기를 누르면 onExtend에 YYYY-MM-DD를 넘긴다", async () => {
    const user = userEvent.setup();
    const { onExtend, dateInput } = renderSheet();

    fireEvent.change(dateInput, { target: { value: "2026-10-20" } });
    expect(screen.getByText("10월 20일")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "연장하기" }));

    expect(onExtend).toHaveBeenCalledWith("2026-10-20");
  });
});
