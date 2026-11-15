import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FundingRevealSheet from "@/widgets/funding/FundingRevealSheet";

// jsdom은 HTMLDialogElement의 showModal/close를 구현하지 않아 open 속성만 토글하도록 대체한다
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

describe("FundingRevealSheet", () => {
  it("열리면 제목과 안내 문구를 보여준다", () => {
    render(<FundingRevealSheet open onClose={vi.fn()} onReveal={vi.fn()} />);

    expect(screen.getByText("펀딩을 공개할까요?")).toBeInTheDocument();
    expect(screen.getByText(/펀딩을 공개하면/)).toBeInTheDocument();
  });

  it("닫혀 있으면 내용을 렌더하지 않는다", () => {
    render(<FundingRevealSheet open={false} onClose={vi.fn()} onReveal={vi.fn()} />);

    expect(screen.queryByText("펀딩을 공개할까요?")).not.toBeInTheDocument();
  });

  it("접근성 이름이 '펀딩 공개'인 dialog로 열린다", () => {
    render(<FundingRevealSheet open onClose={vi.fn()} onReveal={vi.fn()} />);

    expect(screen.getByRole("dialog", { name: "펀딩 공개" })).toBeInTheDocument();
  });

  it("'다음에'를 누르면 onClose만 호출한다", async () => {
    const onClose = vi.fn();
    const onReveal = vi.fn();
    render(<FundingRevealSheet open onClose={onClose} onReveal={onReveal} />);

    await userEvent.click(screen.getByRole("button", { name: "다음에" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onReveal).not.toHaveBeenCalled();
  });

  it("'펀딩 열기'를 누르면 onReveal만 호출한다", async () => {
    const onClose = vi.fn();
    const onReveal = vi.fn();
    render(<FundingRevealSheet open onClose={onClose} onReveal={onReveal} />);

    await userEvent.click(screen.getByRole("button", { name: "펀딩 열기" }));

    expect(onReveal).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });
});
