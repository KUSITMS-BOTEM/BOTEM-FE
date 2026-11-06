import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import BankSelectBottomSheet from "@/widgets/transfer/BankSelectBottomSheet";
import { BANKS } from "@/constants/bank";

// vitest(jsdom) 환경은 Storybook의 @storybook/nextjs-vite 플러그인과 달리 정적 png import를
// {src,width,height} 객체가 아닌 문자열로 반환해, next/image가 "width 누락" 에러를 던진다.
// BANKS의 실제 로고(toss-bank.png, k-bank.png)를 그대로 쓰기 위해 next/image만 단순 img로 대체한다.
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

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
  selectedBank: null,
  onSelectBank: vi.fn(),
  onClose: vi.fn(),
};

describe("BankSelectBottomSheet", () => {
  it("open이 true면 제목과 BANKS 전체 은행 버튼이 렌더된다", () => {
    render(<BankSelectBottomSheet {...baseProps} open />);

    expect(screen.getByText("은행을 선택해주세요")).toBeInTheDocument();
    BANKS.forEach(bank => {
      expect(screen.getByRole("button", { name: new RegExp(bank.name) })).toBeInTheDocument();
    });
  });

  it("open이 false면 다이얼로그가 렌더되지 않는다", () => {
    render(<BankSelectBottomSheet {...baseProps} open={false} />);

    expect(screen.queryByText("은행을 선택해주세요")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: BANKS[0].name })).not.toBeInTheDocument();
  });

  it("selectedBank와 일치하는 은행 버튼만 aria-pressed=true이고 나머지는 false다", () => {
    render(<BankSelectBottomSheet {...baseProps} open selectedBank="kakao" />);

    BANKS.forEach(bank => {
      const expected = bank.code === "kakao" ? "true" : "false";
      expect(screen.getByRole("button", { name: new RegExp(bank.name) })).toHaveAttribute(
        "aria-pressed",
        expected,
      );
    });
  });

  it("selectedBank가 null이면 모든 은행 버튼의 aria-pressed가 false다", () => {
    render(<BankSelectBottomSheet {...baseProps} open selectedBank={null} />);

    BANKS.forEach(bank => {
      expect(screen.getByRole("button", { name: new RegExp(bank.name) })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });
  });

  it("은행 버튼을 클릭하면 onSelectBank이 해당 bank.code로 1회 호출된다", async () => {
    const handleSelectBank = vi.fn();
    const user = userEvent.setup();
    render(<BankSelectBottomSheet {...baseProps} open onSelectBank={handleSelectBank} />);

    await user.click(screen.getByRole("button", { name: "신한" }));

    expect(handleSelectBank).toHaveBeenCalledTimes(1);
    expect(handleSelectBank).toHaveBeenCalledWith("shinhan");
  });

  it("닫기 아이콘 클릭 시 onClose가 1회 호출된다", async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    render(<BankSelectBottomSheet {...baseProps} open onClose={handleClose} />);

    await user.click(screen.getByRole("button", { name: "닫기" }));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("className을 전달하면 BottomSheet 시트 요소에 반영된다", () => {
    const { container } = render(<BankSelectBottomSheet {...baseProps} open className="mt-4" />);

    expect(container.querySelector(".rounded-t-xxx-large")?.className).toContain("mt-4");
  });
});
