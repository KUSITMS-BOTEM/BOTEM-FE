import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ConnectedAccountBottomSheet from "@/widgets/user/ConnectedAccountBottomSheet";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

describe("ConnectedAccountBottomSheet", () => {
  it("연결된 이메일과 'yyyy.MM.dd에 연결' 문구를 보여준다", () => {
    render(
      <ConnectedAccountBottomSheet
        open
        onClose={vi.fn()}
        email="jiyu@kakao.com"
        connectedAt="2026-10-30"
      />,
    );

    expect(screen.getByText("jiyu@kakao.com")).toBeInTheDocument();
    expect(screen.getByText("2026.10.30에 연결")).toBeInTheDocument();
  });

  it("이메일이 없으면 '카카오 계정'으로 보여준다", () => {
    render(
      <ConnectedAccountBottomSheet open onClose={vi.fn()} email={null} connectedAt="2026-10-30" />,
    );

    expect(screen.getByText("카카오 계정")).toBeInTheDocument();
  });

  it("확인을 누르면 onClose를 호출한다", async () => {
    const onClose = vi.fn();
    render(
      <ConnectedAccountBottomSheet open onClose={onClose} email={null} connectedAt="2026-10-30" />,
    );

    await userEvent.click(screen.getByRole("button", { name: "확인" }));

    expect(onClose).toHaveBeenCalled();
  });
});
