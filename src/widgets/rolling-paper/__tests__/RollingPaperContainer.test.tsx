import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RollingPaperContainer from "@/widgets/rolling-paper/RollingPaperContainer";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, prefetch: vi.fn() }),
}));

beforeEach(() => pushMock.mockClear());

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

describe("RollingPaperContainer", () => {
  it("시트 안에 타이틀·힌트·공유 버튼이 보인다", () => {
    const { container } = render(<RollingPaperContainer count={5} />);

    expect(container.querySelector("dialog")).toHaveAttribute("open");
    // 타이틀이 <br />로 줄바꿈돼 textContent에는 두 줄이 공백 없이 이어진다
    expect(container.textContent).toContain("총 5개의 메세지가도착했어요!");
    expect(screen.getByText("클릭 시, 크게 볼 수 있어요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "공유" })).toBeInTheDocument();
  });

  it("하단 CTA에 메시지 열어보기 버튼이 보인다", () => {
    render(<RollingPaperContainer count={5} />);

    expect(screen.getByRole("button", { name: "메시지 열어보기" })).toBeInTheDocument();
  });

  it("타이틀 개수는 받은 편지지 개수를 나타낸다", () => {
    const { container, rerender } = render(<RollingPaperContainer count={3} />);
    expect(container.textContent).toContain("총 3개의 메세지가");

    rerender(<RollingPaperContainer count={12} />);
    expect(container.textContent).toContain("총 12개의 메세지가");
  });

  it("메시지 열어보기를 누르면 하단 CTA가 아래로 내려가며 사라지도록 표시된다", async () => {
    const user = userEvent.setup();
    render(<RollingPaperContainer count={5} />);
    const button = screen.getByRole("button", { name: "메시지 열어보기" });
    const cta = button.closest(".pointer-events-none");
    expect(cta).not.toHaveClass("opacity-0");

    await user.click(button);

    expect(cta).toHaveClass("opacity-0");
  });

  it("메시지 열어보기를 누르면 회색이 다 덮인 뒤에 롤링페이퍼 페이지로 이동한다", async () => {
    const user = userEvent.setup();
    render(<RollingPaperContainer count={5} />);

    await user.click(screen.getByRole("button", { name: "메시지 열어보기" }));
    expect(pushMock).not.toHaveBeenCalled();

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/rolling-paper"), {
      timeout: 3000,
    });
  });

  it("닫기 버튼을 누르면 시트가 닫힌다", async () => {
    const user = userEvent.setup();
    const { container } = render(<RollingPaperContainer count={5} />);

    await user.click(screen.getByRole("button", { name: "닫기" }));

    await waitFor(() => expect(container.querySelector("dialog")).not.toHaveAttribute("open"));
  });
});
