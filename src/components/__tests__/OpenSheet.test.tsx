import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import OpenSheet from "@/components/OpenSheet";

// jsdom은 HTMLDialogElement의 showModal/close를 구현하지 않아 open 속성만 토글하도록 대체한다
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("OpenSheet", () => {
  it("open이 true면 다이얼로그가 열리고 title·children이 보이며 드래그 핸들은 없다", () => {
    const { container } = render(
      <OpenSheet open title="타이틀" onClose={vi.fn()}>
        본문 내용
      </OpenSheet>,
    );

    expect(container.querySelector("dialog")).toHaveAttribute("open");
    expect(screen.getByRole("dialog", { name: "타이틀" })).toBeInTheDocument();
    expect(screen.getByText("본문 내용")).toBeInTheDocument();
    expect(container.querySelector(".bg-semantic-border-default")).not.toBeInTheDocument();
  });

  it("open이 false면 다이얼로그가 열리지 않는다", () => {
    const { container } = render(
      <OpenSheet open={false} title="타이틀" onClose={vi.fn()}>
        본문 내용
      </OpenSheet>,
    );

    expect(container.querySelector("dialog")).not.toHaveAttribute("open");
    expect(screen.queryByText("본문 내용")).not.toBeInTheDocument();
  });

  it("닫기 아이콘 클릭 시 onClose가 호출된다", async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    render(
      <OpenSheet open title="타이틀" onClose={handleClose}>
        본문 내용
      </OpenSheet>,
    );

    await user.click(screen.getByRole("button", { name: "닫기" }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("ESC(cancel 이벤트) 시 브라우저 기본 닫힘이 막히고 onClose가 호출된다", () => {
    const handleClose = vi.fn();
    const { container } = render(
      <OpenSheet open title="타이틀" onClose={handleClose}>
        본문 내용
      </OpenSheet>,
    );

    const notPrevented = fireEvent(
      container.querySelector("dialog")!,
      new Event("cancel", { cancelable: true }),
    );
    expect(notPrevented).toBe(false);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("open이 false로 바뀌면 exit 애니메이션 종료 후 dialog.close()가 호출되고 onClose는 추가 호출되지 않는다", async () => {
    const handleClose = vi.fn();
    const { container, rerender } = render(
      <OpenSheet open title="타이틀" onClose={handleClose}>
        본문 내용
      </OpenSheet>,
    );
    const dialog = container.querySelector("dialog")!;

    rerender(
      <OpenSheet open={false} title="타이틀" onClose={handleClose}>
        본문 내용
      </OpenSheet>,
    );

    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
    expect(handleClose).not.toHaveBeenCalled();
  });
});
