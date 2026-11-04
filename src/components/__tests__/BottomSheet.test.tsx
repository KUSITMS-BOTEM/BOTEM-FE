import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import BottomSheet from "@/components/BottomSheet";

// jsdom은 HTMLDialogElement의 showModal/close를 구현하지 않아 open 속성만 토글하도록 대체한다
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

const baseProps = {
  title: "타이틀",
  leftButtonLabel: "취소",
  rightButtonLabel: "확인",
  onLeftButtonClick: vi.fn(),
  onRightButtonClick: vi.fn(),
  onClose: vi.fn(),
};

describe("BottomSheet", () => {
  it("open이 true면 다이얼로그가 열리고 title·children·좌우 버튼 라벨이 보인다", () => {
    const { container } = render(
      <BottomSheet {...baseProps} open height="auto">
        본문 내용
      </BottomSheet>,
    );

    expect(container.querySelector("dialog")).toHaveAttribute("open");
    expect(screen.getByRole("dialog", { name: "타이틀" })).toBeInTheDocument();
    expect(screen.getByText("본문 내용")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "확인" })).toBeInTheDocument();
  });

  it("open이 false면 다이얼로그가 열리지 않는다", () => {
    const { container } = render(
      <BottomSheet {...baseProps} open={false} height="auto">
        본문 내용
      </BottomSheet>,
    );

    expect(container.querySelector("dialog")).not.toHaveAttribute("open");
    expect(screen.queryByRole("dialog", { name: "타이틀" })).not.toBeInTheDocument();
  });

  it('height="max"면 고정 높이 클래스가 적용된다', () => {
    render(
      <BottomSheet {...baseProps} open height="max">
        본문 내용
      </BottomSheet>,
    );

    expect(screen.getByRole("dialog", { name: "타이틀" }).className).toContain(
      "h-[calc(100dvh_-_env(safe-area-inset-top)_-_32px)]",
    );
  });

  it('height="auto"면 최대 높이 클래스가 적용된다', () => {
    render(
      <BottomSheet {...baseProps} open height="auto">
        본문 내용
      </BottomSheet>,
    );

    expect(screen.getByRole("dialog", { name: "타이틀" }).className).toContain(
      "max-h-[calc(100dvh_-_env(safe-area-inset-top)_-_32px)]",
    );
  });

  it("왼쪽 버튼을 클릭하면 onLeftButtonClick만 호출된다", async () => {
    const handleLeft = vi.fn();
    const handleRight = vi.fn();
    const user = userEvent.setup();
    render(
      <BottomSheet
        {...baseProps}
        open
        height="auto"
        onLeftButtonClick={handleLeft}
        onRightButtonClick={handleRight}>
        본문 내용
      </BottomSheet>,
    );

    await user.click(screen.getByRole("button", { name: "취소" }));

    expect(handleLeft).toHaveBeenCalledTimes(1);
    expect(handleRight).not.toHaveBeenCalled();
  });

  it("오른쪽 버튼을 클릭하면 onRightButtonClick만 호출된다", async () => {
    const handleLeft = vi.fn();
    const handleRight = vi.fn();
    const user = userEvent.setup();
    render(
      <BottomSheet
        {...baseProps}
        open
        height="auto"
        onLeftButtonClick={handleLeft}
        onRightButtonClick={handleRight}>
        본문 내용
      </BottomSheet>,
    );

    await user.click(screen.getByRole("button", { name: "확인" }));

    expect(handleRight).toHaveBeenCalledTimes(1);
    expect(handleLeft).not.toHaveBeenCalled();
  });

  it("닫기 아이콘 클릭 시 onClose가 바로 호출된다", async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    render(
      <BottomSheet {...baseProps} open height="auto" onClose={handleClose}>
        본문 내용
      </BottomSheet>,
    );

    await user.click(screen.getByRole("button", { name: "닫기" }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("딤(배경) 클릭 시 onClose가 바로 호출된다", async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <BottomSheet {...baseProps} open height="auto" onClose={handleClose}>
        본문 내용
      </BottomSheet>,
    );

    const dim = container.querySelector(".bg-semantic-background-dim");
    expect(dim).not.toBeNull();
    await user.click(dim!);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("ESC(cancel 이벤트) 시 브라우저 기본 닫힘이 막히고 onClose가 바로 호출된다", () => {
    const handleClose = vi.fn();
    const { container } = render(
      <BottomSheet {...baseProps} open height="auto" onClose={handleClose}>
        본문 내용
      </BottomSheet>,
    );

    const notPrevented = fireEvent(
      container.querySelector("dialog")!,
      new Event("cancel", { cancelable: true }),
    );
    expect(notPrevented).toBe(false);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
