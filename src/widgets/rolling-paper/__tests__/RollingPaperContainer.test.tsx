import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RollingPaperContainer from "@/widgets/rolling-paper/RollingPaperContainer";

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
    const { container } = render(<RollingPaperContainer />);

    expect(container.querySelector("dialog")).toHaveAttribute("open");
    // 타이틀이 <br />로 줄바꿈돼 textContent에는 두 줄이 공백 없이 이어진다
    expect(container.textContent).toContain("총 5개의 메세지가도착했어요!");
    expect(screen.getByText("클릭 시, 크게 볼 수 있어요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "공유" })).toBeInTheDocument();
  });

  it("닫기 버튼을 누르면 시트가 닫힌다", async () => {
    const user = userEvent.setup();
    const { container } = render(<RollingPaperContainer />);

    await user.click(screen.getByRole("button", { name: "닫기" }));

    await waitFor(() => expect(container.querySelector("dialog")).not.toHaveAttribute("open"));
  });
});
