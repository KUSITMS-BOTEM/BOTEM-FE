import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import GlobalErrorDialog from "../GlobalErrorDialog";
import { useErrorDialogStore } from "@/store/errorDialogStore";

describe("GlobalErrorDialog", () => {
  beforeAll(() => {
    // jsdom은 dialog.showModal/close를 구현하지 않는다
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute("open");
    };
  });

  afterEach(() => {
    act(() => useErrorDialogStore.getState().closeErrorDialog());
  });

  it("store에 message가 있으면 해당 메시지로 Dialog를 연다", () => {
    render(<GlobalErrorDialog />);
    act(() => useErrorDialogStore.getState().openErrorDialog("오류가 발생했어요."));

    expect(screen.getByRole("dialog", { name: "오류가 발생했어요." })).toBeInTheDocument();
  });

  it("확인 버튼을 누르면 Dialog가 닫히고 message가 비워진다", async () => {
    render(<GlobalErrorDialog />);
    act(() => useErrorDialogStore.getState().openErrorDialog("오류가 발생했어요."));

    await userEvent.click(screen.getByRole("button", { name: "확인" }));

    expect(useErrorDialogStore.getState().message).toBeNull();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
