import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SurpriseNotifySheet from "@/widgets/funding/SurpriseNotifySheet";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

const renderSheet = (props = {}) =>
  render(
    <SurpriseNotifySheet
      open
      recipientName="민지"
      onSelect={vi.fn()}
      onClose={vi.fn()}
      {...props}
    />,
  );

describe("SurpriseNotifySheet", () => {
  it("질문과 받는 사람에게 보이지 않는다는 안내를 보여준다", () => {
    renderSheet();

    expect(screen.getByText("보탠 친구에게도 알릴까요?")).toBeInTheDocument();
    expect(screen.getByText("서프라이즈 펀딩은 민지에게 보이지 않아요")).toBeInTheDocument();
  });

  it("예를 누르면 true로 onSelect를 호출한다", async () => {
    const onSelect = vi.fn();
    renderSheet({ onSelect });

    await userEvent.click(screen.getByRole("button", { name: "예" }));

    expect(onSelect).toHaveBeenCalledWith(true);
  });

  it("아니오를 누르면 false로 onSelect를 호출한다", async () => {
    const onSelect = vi.fn();
    renderSheet({ onSelect });

    await userEvent.click(screen.getByRole("button", { name: "아니오" }));

    expect(onSelect).toHaveBeenCalledWith(false);
  });

  it("닫기를 누르면 선택 없이 onClose를 호출한다", async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    renderSheet({ onSelect, onClose });

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
