import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CloseSheet from "@/components/CloseSheet";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

describe("CloseSheet", () => {
  it("open이면 title·children을 보여주고, 닫기를 누르면 onClose를 호출한다", async () => {
    const onClose = vi.fn();
    render(
      <CloseSheet open title="타이틀" onClose={onClose}>
        본문
      </CloseSheet>,
    );

    expect(screen.getByRole("dialog", { name: "타이틀" })).toBeInTheDocument();
    expect(screen.getByText("본문")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("open이 false로 바뀌면 퇴장 모션이 끝난 뒤 dialog를 닫는다", async () => {
    const { container, rerender } = render(
      <CloseSheet open title="타이틀" onClose={vi.fn()}>
        본문
      </CloseSheet>,
    );

    rerender(
      <CloseSheet open={false} title="타이틀" onClose={vi.fn()}>
        본문
      </CloseSheet>,
    );

    await waitFor(() => expect(container.querySelector("dialog")).not.toHaveAttribute("open"));
  });

  it('closeType="back"이면 닫기 대신 뒤로 가기 버튼으로 닫는다', async () => {
    const onClose = vi.fn();
    render(
      <CloseSheet open title="타이틀" closeType="back" onClose={onClose}>
        본문
      </CloseSheet>,
    );

    expect(screen.queryByRole("button", { name: "닫기" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));
    expect(onClose).toHaveBeenCalled();
  });
});
