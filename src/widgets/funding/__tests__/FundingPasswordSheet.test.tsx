import { useState } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FundingPasswordSheet from "@/widgets/funding/FundingPasswordSheet";

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

type HarnessProps = {
  onClose?: () => void;
  onPrev?: () => void;
  onComplete?: (password: string) => void;
  closeOnComplete?: boolean;
};

function Harness({
  onClose,
  onPrev = vi.fn(),
  onComplete = vi.fn(),
  closeOnComplete,
}: HarnessProps) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button onClick={() => setOpen(true)}>열기</button>
      <FundingPasswordSheet
        open={open}
        hostName="지유"
        amount={50000}
        account={ACCOUNT}
        onClose={() => {
          onClose?.();
          setOpen(false);
        }}
        onPrev={onPrev}
        onComplete={password => {
          onComplete(password);
          if (closeOnComplete) setOpen(false);
        }}
      />
    </>
  );
}

const getInput = () => screen.getByLabelText("비밀번호 4자리");
const getComplete = () => screen.getByRole("button", { name: "보태러 가기" });
const getGuideHeading = () => screen.queryByRole("heading", { level: 1 });
const finishGuide = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("checkbox", { name: "송금했어요" }));
  await user.click(screen.getByRole("button", { name: "완료하기" }));
};

describe("FundingPasswordSheet", () => {
  it("제목·안내 문구·헤더가 보인다", () => {
    render(<Harness />);
    expect(screen.getByText("지유에게 보태기")).toBeInTheDocument();
    expect(screen.getByText(/비밀번호 4자리를 정해주세요/)).toBeInTheDocument();
    expect(screen.getByText("나중에 메시지를 고칠 때 이름과 함께 써요")).toBeInTheDocument();
  });

  it("입력 영역은 숫자 키패드(inputMode=numeric)를 쓴다", () => {
    render(<Harness />);
    expect(getInput()).toHaveAttribute("inputmode", "numeric");
  });

  it("입력 영역 모션이 끝나면 자동으로 포커스된다", async () => {
    render(<Harness />);
    await waitFor(() => expect(getInput()).toHaveFocus(), { timeout: 3000 });
  });

  it("4자리 전에는 보태러 가기가 비활성이고 4자리가 되면 활성화된다", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(getComplete()).toBeDisabled();

    await user.type(getInput(), "123");
    expect(getComplete()).toBeDisabled();

    await user.type(getInput(), "4");
    expect(getComplete()).toBeEnabled();
  });

  it("4자리를 입력하고 0.4초 뒤에 포커스가 해제되어 키패드가 내려간다", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<Harness />);
      await user.type(getInput(), "1234");
      expect(getInput()).toHaveFocus();

      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(getInput()).not.toHaveFocus();
    } finally {
      vi.useRealTimers();
    }
  });

  it("보태러 가기를 누르면 송금 안내 시트가 나타나고 아직 onComplete는 호출되지 않는다", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);
    expect(getGuideHeading()).not.toBeInTheDocument();

    await user.type(getInput(), "1234");
    await user.click(getComplete());

    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("지유의 계좌로");
    expect(heading).toHaveTextContent("50,000원");
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("송금 안내 시트에서 완료하기를 누르면 입력한 비밀번호와 함께 onComplete가 한 번만 호출된다", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);
    await user.type(getInput(), "1234");
    await user.click(getComplete());

    await user.click(await screen.findByRole("checkbox", { name: "송금했어요" }));
    await user.dblClick(screen.getByRole("button", { name: "완료하기" }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("1234");
  });

  it("송금 안내 시트에서 뒤로 가기를 누르면 비밀번호 시트로 돌아오고 입력은 유지된다", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    await user.type(getInput(), "1234");
    await user.click(getComplete());
    await screen.findByRole("heading", { level: 1 });

    await user.click(screen.getByRole("button", { name: "뒤로 가기" }));

    await waitFor(() => expect(getGuideHeading()).not.toBeInTheDocument());
    expect(getInput()).toHaveValue("1234");
    expect(getComplete()).toBeEnabled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("이전을 누르면 onPrev가 호출된다", async () => {
    const user = userEvent.setup();
    const onPrev = vi.fn();
    render(<Harness onPrev={onPrev} />);
    await user.click(screen.getByRole("button", { name: "이전" }));
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it("완료 후 부모가 닫았다 다시 열면 입력과 송금 안내가 초기화되고 다시 완료할 수 있다", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} closeOnComplete />);
    await user.type(getInput(), "1234");
    await user.click(getComplete());
    await screen.findByRole("heading", { level: 1 });
    await finishGuide(user);
    await waitFor(() => expect(screen.queryByLabelText("비밀번호 4자리")).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "열기" }));
    expect(getInput()).toHaveValue("");
    expect(getGuideHeading()).not.toBeInTheDocument();

    await user.type(getInput(), "5678");
    await user.click(getComplete());
    await screen.findByRole("heading", { level: 1 });
    await finishGuide(user);
    expect(onComplete).toHaveBeenCalledTimes(2);
    expect(onComplete).toHaveBeenLastCalledWith("5678");
  });
});
