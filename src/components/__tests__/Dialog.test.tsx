import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Dialog from "@/components/Dialog";

// jsdom은 HTMLDialogElement의 showModal/close를 구현하지 않아 open 속성만 토글하도록 대체한다
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

describe("Dialog", () => {
  it("open이 true면 열리고 제목·설명이 보이며 제목이 다이얼로그 이름이 된다", () => {
    render(<Dialog open kind="alert" title="타이틀" description="추가설명" onConfirm={vi.fn()} />);

    const dialog = screen.getByRole("dialog", { name: "타이틀" });
    expect(dialog).toHaveAttribute("open");
    expect(dialog).toHaveAccessibleDescription("추가설명");
  });

  it("열리면 버튼이 아니라 다이얼로그 자체에 포커스가 간다", () => {
    render(<Dialog open kind="alert" title="타이틀" onConfirm={vi.fn()} />);

    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  it("description이 없으면 설명 문단과 aria-describedby가 없다", () => {
    render(<Dialog open kind="alert" title="타이틀" onConfirm={vi.fn()} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).not.toHaveAttribute("aria-describedby");
    expect(dialog.querySelector("p")).not.toBeInTheDocument();
  });

  it("alert는 기본 라벨 '확인'을 보여주고 누르면 onConfirm이 1번 호출된다", async () => {
    const handleConfirm = vi.fn();
    const user = userEvent.setup();
    render(<Dialog open kind="alert" title="타이틀" onConfirm={handleConfirm} />);

    await user.click(screen.getByRole("button", { name: "확인" }));

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("alert에 confirmLabel을 넘기면 그 라벨로 보인다", () => {
    render(<Dialog open kind="alert" title="타이틀" confirmLabel="닫기" onConfirm={vi.fn()} />);

    expect(screen.getByRole("button", { name: "닫기" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "확인" })).not.toBeInTheDocument();
  });

  it("confirm은 '예'·'아니오'를 보여주고 각각 onConfirm·onCancel만 호출한다", async () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();
    const user = userEvent.setup();
    render(
      <Dialog
        open
        kind="confirm"
        title="타이틀"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />,
    );

    await user.click(screen.getByRole("button", { name: "예" }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleCancel).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "아니오" }));
    expect(handleCancel).toHaveBeenCalledTimes(1);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("confirm 가로 배치면 버튼 순서가 아니오 → 예다", () => {
    render(<Dialog open kind="confirm" title="타이틀" onConfirm={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getAllByRole("button").map(b => b.textContent)).toEqual(["아니오", "예"]);
  });

  it("confirm 세로 배치면 Tab 순서가 화면과 같도록 버튼 순서가 예 → 아니오다", () => {
    render(
      <Dialog
        open
        kind="confirm"
        direction="vertical"
        title="타이틀"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getAllByRole("button").map(b => b.textContent)).toEqual(["예", "아니오"]);
  });

  it("confirm에 confirmLabel·cancelLabel을 넘기면 그 라벨로 보인다", () => {
    render(
      <Dialog
        open
        kind="confirm"
        title="타이틀"
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getAllByRole("button").map(b => b.textContent)).toEqual(["취소", "삭제"]);
  });

  it("ESC(cancel 이벤트) 시 confirm은 onCancel을 호출하고 브라우저 기본 닫힘을 막는다", () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();
    render(
      <Dialog
        open
        kind="confirm"
        title="타이틀"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />,
    );

    const notPrevented = fireEvent(
      screen.getByRole("dialog"),
      new Event("cancel", { cancelable: true }),
    );

    expect(notPrevented).toBe(false);
    expect(handleCancel).toHaveBeenCalledTimes(1);
    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it("ESC(cancel 이벤트) 시 alert는 onConfirm을 호출한다", () => {
    const handleConfirm = vi.fn();
    render(<Dialog open kind="alert" title="타이틀" onConfirm={handleConfirm} />);

    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("open이 true에서 false로 바뀌면 닫힌다", () => {
    const { rerender } = render(<Dialog open kind="alert" title="타이틀" onConfirm={vi.fn()} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("open");

    rerender(<Dialog open={false} kind="alert" title="타이틀" onConfirm={vi.fn()} />);

    expect(dialog).not.toHaveAttribute("open");
  });
});
