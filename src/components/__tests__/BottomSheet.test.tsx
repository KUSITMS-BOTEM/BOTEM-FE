import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import BottomSheet from "@/components/BottomSheet";

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

const baseProps = {
  title: "타이틀",
  buttons: {
    leftLabel: "취소",
    rightLabel: "확인",
    onLeftClick: vi.fn(),
    onRightClick: vi.fn(),
  },
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
    const { container } = render(
      <BottomSheet {...baseProps} open height="max">
        본문 내용
      </BottomSheet>,
    );

    expect(container.querySelector(".overflow-clip")?.className).toContain(
      "h-[calc(100dvh_-_env(safe-area-inset-top)_+_24px)]",
    );
  });

  it('height="auto"면 최대 높이 클래스가 적용된다', () => {
    const { container } = render(
      <BottomSheet {...baseProps} open height="auto">
        본문 내용
      </BottomSheet>,
    );

    expect(container.querySelector(".overflow-clip")?.className).toContain(
      "max-h-[calc(100dvh_-_env(safe-area-inset-top)_-_32px)]",
    );
  });

  it('height="max"면 상단 모서리가 둥글지 않고 드래그 핸들이 보이지 않는다', () => {
    const { container } = render(
      <BottomSheet {...baseProps} open height="max">
        본문 내용
      </BottomSheet>,
    );

    expect(container.querySelector(".overflow-clip")?.className).not.toContain(
      "rounded-t-xxx-large",
    );
    expect(container.querySelector(".bg-semantic-border-default")).not.toBeInTheDocument();
  });

  it('height="auto"면 상단 모서리가 둥글고 드래그 핸들이 보인다', () => {
    const { container } = render(
      <BottomSheet {...baseProps} open height="auto">
        본문 내용
      </BottomSheet>,
    );

    expect(container.querySelector(".overflow-clip")?.className).toContain("rounded-t-xxx-large");
    expect(container.querySelector(".bg-semantic-border-default")).toBeInTheDocument();
  });

  it("왼쪽 버튼을 클릭하면 onLeftClick만 호출된다", async () => {
    const handleLeft = vi.fn();
    const handleRight = vi.fn();
    const user = userEvent.setup();
    render(
      <BottomSheet
        {...baseProps}
        open
        height="auto"
        buttons={{
          leftLabel: "취소",
          rightLabel: "확인",
          onLeftClick: handleLeft,
          onRightClick: handleRight,
        }}>
        본문 내용
      </BottomSheet>,
    );

    await user.click(screen.getByRole("button", { name: "취소" }));

    expect(handleLeft).toHaveBeenCalledTimes(1);
    expect(handleRight).not.toHaveBeenCalled();
  });

  it("오른쪽 버튼을 클릭하면 onRightClick만 호출된다", async () => {
    const handleLeft = vi.fn();
    const handleRight = vi.fn();
    const user = userEvent.setup();
    render(
      <BottomSheet
        {...baseProps}
        open
        height="auto"
        buttons={{
          leftLabel: "취소",
          rightLabel: "확인",
          onLeftClick: handleLeft,
          onRightClick: handleRight,
        }}>
        본문 내용
      </BottomSheet>,
    );

    await user.click(screen.getByRole("button", { name: "확인" }));

    expect(handleRight).toHaveBeenCalledTimes(1);
    expect(handleLeft).not.toHaveBeenCalled();
  });

  it("buttons를 넘기지 않으면 버튼 영역이 렌더되지 않는다", () => {
    render(
      <BottomSheet open height="auto" title="타이틀" onClose={vi.fn()}>
        본문 내용
      </BottomSheet>,
    );

    expect(screen.queryByRole("button", { name: "취소" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "확인" })).not.toBeInTheDocument();
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

  it("브라우저가 네이티브 close로 dialog를 강제로 닫으면 onClose가 호출되어 상태가 동기화된다", () => {
    const handleClose = vi.fn();
    const { container } = render(
      <BottomSheet {...baseProps} open height="auto" onClose={handleClose}>
        본문 내용
      </BottomSheet>,
    );

    fireEvent(container.querySelector("dialog")!, new Event("close"));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("open이 false로 바뀌면 exit 애니메이션 종료 후 dialog.close()가 호출되고, 이때 onClose는 추가로 호출되지 않는다", async () => {
    const handleClose = vi.fn();
    const { container, rerender } = render(
      <BottomSheet {...baseProps} open height="auto" onClose={handleClose}>
        본문 내용
      </BottomSheet>,
    );
    const dialog = container.querySelector("dialog")!;
    expect(dialog).toHaveAttribute("open");

    rerender(
      <BottomSheet {...baseProps} open={false} height="auto" onClose={handleClose}>
        본문 내용
      </BottomSheet>,
    );

    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
    expect(handleClose).not.toHaveBeenCalled();
  });

  it("닫힌 뒤 다시 열면 showModal이 다시 호출된다", async () => {
    const { container, rerender } = render(
      <BottomSheet {...baseProps} open height="auto">
        본문 내용
      </BottomSheet>,
    );
    const dialog = container.querySelector("dialog")!;
    expect(dialog.showModal).toHaveBeenCalledTimes(1);

    rerender(
      <BottomSheet {...baseProps} open={false} height="auto">
        본문 내용
      </BottomSheet>,
    );
    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));

    rerender(
      <BottomSheet {...baseProps} open height="auto">
        본문 내용
      </BottomSheet>,
    );

    expect(dialog.showModal).toHaveBeenCalledTimes(2);
  });

  it("exit 애니메이션 도중 다시 열면 showModal이 중복 호출되지 않고 시트가 계속 보인다", () => {
    const { container, rerender } = render(
      <BottomSheet {...baseProps} open height="auto">
        본문 내용
      </BottomSheet>,
    );
    const dialog = container.querySelector("dialog")!;
    expect(dialog.showModal).toHaveBeenCalledTimes(1);

    rerender(
      <BottomSheet {...baseProps} open={false} height="auto">
        본문 내용
      </BottomSheet>,
    );
    rerender(
      <BottomSheet {...baseProps} open height="auto">
        본문 내용
      </BottomSheet>,
    );

    expect(dialog.showModal).toHaveBeenCalledTimes(1);
    expect(screen.getByText("본문 내용")).toBeInTheDocument();
  });
});

describe("BottomSheet leftDisabled·upper·toast", () => {
  it("leftDisabled가 true면 왼쪽 버튼만 비활성이다", () => {
    render(
      <BottomSheet
        {...baseProps}
        buttons={{ ...baseProps.buttons, leftDisabled: true }}
        open
        height="auto">
        본문 내용
      </BottomSheet>,
    );

    expect(screen.getByRole("button", { name: "취소" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "확인" })).toBeEnabled();
  });

  it("leftDisabled가 없으면 왼쪽 버튼이 활성이다", () => {
    render(
      <BottomSheet {...baseProps} open height="auto">
        본문 내용
      </BottomSheet>,
    );

    expect(screen.getByRole("button", { name: "취소" })).toBeEnabled();
  });

  it("buttons.upper를 렌더한다", () => {
    render(
      <BottomSheet
        {...baseProps}
        buttons={{ ...baseProps.buttons, upper: <span>전체 선택</span> }}
        open
        height="auto">
        본문 내용
      </BottomSheet>,
    );

    expect(screen.getByText("전체 선택")).toBeInTheDocument();
  });

  it("toast를 렌더한다", () => {
    render(
      <BottomSheet {...baseProps} toast={<span>토스트 메시지</span>} open height="auto">
        본문 내용
      </BottomSheet>,
    );

    expect(screen.getByText("토스트 메시지")).toBeInTheDocument();
  });

  it("buttons 없이 toast만 넘겨도 toast를 렌더한다", () => {
    render(
      <BottomSheet
        title="타이틀"
        onClose={vi.fn()}
        toast={<span>토스트 메시지</span>}
        open
        height="auto">
        본문 내용
      </BottomSheet>,
    );

    expect(screen.getByText("토스트 메시지")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "확인" })).not.toBeInTheDocument();
  });
});

describe("BottomSheet rightColor", () => {
  it("rightColor가 없으면 오른쪽 버튼이 brand fill이다", () => {
    render(
      <BottomSheet
        open
        height="auto"
        title="타이틀"
        onClose={vi.fn()}
        buttons={{ rightLabel: "확인" }}>
        본문
      </BottomSheet>,
    );

    expect(screen.getByRole("button", { name: "확인" })).toHaveClass("bg-semantic-fill-brand");
  });

  it('rightColor="neutral"이면 오른쪽 버튼이 neutral weak이다', () => {
    render(
      <BottomSheet
        open
        height="auto"
        title="타이틀"
        onClose={vi.fn()}
        buttons={{ rightLabel: "확인", rightColor: "neutral" }}>
        본문
      </BottomSheet>,
    );

    expect(screen.getByRole("button", { name: "확인" })).toHaveClass(
      "bg-semantic-fill-neutral-weak",
    );
  });
});
