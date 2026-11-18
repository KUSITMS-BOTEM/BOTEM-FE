import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SurpriseRevealSheet from "@/widgets/funding/SurpriseRevealSheet";

// jsdom에 없는 dialog API를 단순 대체한다
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

const baseProps = {
  open: true,
  recipientName: "지유",
  contributorNames: ["지민", "서연", "도윤"],
  totalAmount: 429000,
  onClose: vi.fn(),
};

describe("SurpriseRevealSheet", () => {
  it("받는 사람 이름·참여 인원·모인 금액을 보여준다", () => {
    render(<SurpriseRevealSheet {...baseProps} />);

    expect(
      screen.getByRole("heading", { name: /지유야, 친구 3명이\s*몰래 준비했어!/ }),
    ).toBeVisible();
    expect(screen.getByText("429,000원이 모였어요")).toBeVisible();
  });

  it("받침이 있는 이름에는 '아'를 붙인다", () => {
    render(<SurpriseRevealSheet {...baseProps} recipientName="민준" />);

    expect(screen.getByRole("heading", { name: /민준아, 친구/ })).toBeVisible();
  });

  it("보탠 친구 이름을 칩으로 보여준다", () => {
    render(<SurpriseRevealSheet {...baseProps} />);

    // 칩은 애니메이션 시작 시 opacity 0이라 존재 여부만 확인한다
    expect(screen.getByText("서연")).toBeInTheDocument();
  });

  it("닫기를 누르면 onClose를 호출한다", async () => {
    const onClose = vi.fn();
    render(<SurpriseRevealSheet {...baseProps} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("메시지 열어보기를 누르면 onOpenMessage를 호출한다", async () => {
    const onOpenMessage = vi.fn();
    render(<SurpriseRevealSheet {...baseProps} onOpenMessage={onOpenMessage} />);

    await userEvent.click(screen.getByRole("button", { name: "메시지 열어보기" }));

    expect(onOpenMessage).toHaveBeenCalledTimes(1);
  });

  it("open이 false면 내용을 그리지 않는다", () => {
    render(<SurpriseRevealSheet {...baseProps} open={false} />);

    expect(screen.queryByText("429,000원이 모였어요")).not.toBeInTheDocument();
  });
});
