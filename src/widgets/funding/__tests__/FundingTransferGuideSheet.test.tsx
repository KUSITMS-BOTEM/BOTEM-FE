import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FundingTransferGuideSheet from "@/widgets/funding/FundingTransferGuideSheet";

// 정적 import 이미지는 jsdom에서 문자열이라 next/image가 width 누락 에러를 던진다. 단순 img로 대체한다.
vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

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

const ACCOUNT = {
  bank: "TOSS_BANK",
  accountHolder: "김지유",
  accountNumber: "1000-1234-5678",
} as const;

type HarnessProps = { onClose?: () => void; onComplete?: () => void };

function Harness({ onClose, onComplete = vi.fn() }: HarnessProps) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button onClick={() => setOpen(true)}>열기</button>
      <FundingTransferGuideSheet
        open={open}
        hostName="지유"
        amount={50000}
        account={ACCOUNT}
        onClose={() => {
          onClose?.();
          setOpen(false);
        }}
        onComplete={onComplete}
      />
    </>
  );
}

const getComplete = () => screen.getByRole("button", { name: "완료하기" });
const getCheckbox = () => screen.getByRole("checkbox", { name: "송금했어요" });

describe("FundingTransferGuideSheet", () => {
  it("제목에 개설자 이름과 천 단위 쉼표가 들어간 금액을 보여준다", () => {
    render(<Harness />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("지유의 계좌로");
    expect(heading).toHaveTextContent("50,000원");
  });

  it("계좌 카드에 예금주와 은행명·계좌번호를 보여준다", () => {
    render(<Harness />);

    expect(screen.getByText("김지유")).toBeInTheDocument();
    expect(screen.getByText("토스뱅크 1000-1234-5678")).toBeInTheDocument();
  });

  it("계좌복사를 누르면 은행명과 계좌번호를 클립보드에 복사하고 성공 토스트를 띄운다", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const writeText = vi.spyOn(navigator.clipboard, "writeText");

    await user.click(screen.getByRole("button", { name: "계좌복사" }));

    expect(writeText).toHaveBeenCalledWith("토스뱅크 1000-1234-5678");
    expect(await screen.findByText("계좌번호를 복사했어요")).toBeInTheDocument();
  });

  it("클립보드 쓰기가 실패하면 실패 토스트를 띄운다", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));

    await user.click(screen.getByRole("button", { name: "계좌복사" }));

    expect(await screen.findByText("복사하지 못했어요")).toBeInTheDocument();
  });

  it("송금했어요를 체크해야 완료하기가 활성화되고 누르면 onComplete가 호출된다", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);

    expect(getComplete()).toBeDisabled();

    await user.click(getCheckbox());
    expect(getComplete()).toBeEnabled();

    await user.click(getComplete());
    expect(onComplete).toHaveBeenCalledTimes(1);

    await user.click(getCheckbox());
    expect(getComplete()).toBeDisabled();
  });

  it("뒤로가기를 누르면 onClose가 호출되고, 체크한 채 닫았다 다시 열면 체크가 해제돼 있다", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    await user.click(getCheckbox());

    await user.click(screen.getByRole("button", { name: "뒤로 가기" }));
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "열기" }));
    expect(getCheckbox()).not.toBeChecked();
  });
});
