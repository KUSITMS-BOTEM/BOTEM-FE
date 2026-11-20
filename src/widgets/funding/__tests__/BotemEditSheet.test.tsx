import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import BotemEditSheet from "@/widgets/funding/BotemEditSheet";

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

type HarnessProps = {
  onSubmit?: (name: string, password: string) => void;
  closeOnSubmit?: boolean;
  errorMessage?: string;
  isPending?: boolean;
};

function Harness({ onSubmit = vi.fn(), closeOnSubmit, errorMessage, isPending }: HarnessProps) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button onClick={() => setOpen(true)}>열기</button>
      <BotemEditSheet
        open={open}
        errorMessage={errorMessage}
        isPending={isPending}
        onClose={() => setOpen(false)}
        onSubmit={(name, password) => {
          onSubmit(name, password);
          if (closeOnSubmit) setOpen(false);
        }}
      />
    </>
  );
}

const getName = () => screen.getByLabelText("이름");
const getPassword = () => screen.getByLabelText("비밀번호 4자리");
const getSubmit = () => screen.getByRole("button", { name: "확인" });

describe("BotemEditSheet", () => {
  it("헤더 제목과 안내 문구가 보인다", () => {
    render(<Harness />);
    expect(screen.getByText("내 보탬 찾기")).toBeInTheDocument();
    expect(screen.getByText(/이름과 비밀번호 4자리를/)).toBeInTheDocument();
  });

  it("비밀번호 입력은 숫자 키패드(inputMode=numeric)를 쓰고 숫자만 4자리까지 받는다", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(getPassword()).toHaveAttribute("inputmode", "numeric");

    await user.type(getPassword(), "a1b2c3d4e5");
    expect(getPassword()).toHaveValue("1234");
  });

  it("이름과 비밀번호 4자리를 모두 채워야 확인이 활성화된다", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(getSubmit()).toBeDisabled();

    await user.type(getName(), "민수");
    expect(getSubmit()).toBeDisabled();

    await user.type(getPassword(), "123");
    expect(getSubmit()).toBeDisabled();

    await user.type(getPassword(), "4");
    expect(getSubmit()).toBeEnabled();
  });

  it("공백뿐인 이름은 입력으로 치지 않는다", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(getName(), "   ");
    await user.type(getPassword(), "1234");
    expect(getSubmit()).toBeDisabled();
  });

  it("확인을 누르면 앞뒤 공백을 뺀 이름과 비밀번호로 onSubmit이 호출된다", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    await user.type(getName(), " 민수 ");
    await user.type(getPassword(), "1234");
    await user.click(getSubmit());

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith("민수", "1234");
  });

  it("비밀번호 입력란에서 Enter를 눌러도 제출된다", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    await user.type(getName(), "민수");
    await user.type(getPassword(), "1234{Enter}");

    expect(onSubmit).toHaveBeenCalledWith("민수", "1234");
  });

  it("입력이 덜 찼으면 Enter를 눌러도 제출되지 않는다", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    await user.type(getName(), "민수");
    await user.type(getPassword(), "12{Enter}");

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("입력란 사이를 옮겨도 키보드 상태가 유지되고, 입력 영역을 벗어나면 풀린다", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const isCtaHidden = () => getSubmit().closest(".pointer-coarse\\:hidden") !== null;

    await user.click(getName());
    expect(isCtaHidden()).toBe(true);

    await user.tab();
    expect(getPassword()).toHaveFocus();
    expect(isCtaHidden()).toBe(true);

    await user.click(document.body);
    expect(isCtaHidden()).toBe(false);
  });

  it("닫았다 다시 열면 입력이 비워진다", async () => {
    const user = userEvent.setup();
    render(<Harness closeOnSubmit />);
    await user.type(getName(), "민수");
    await user.type(getPassword(), "1234");
    await user.click(getSubmit());
    await waitFor(() => expect(screen.queryByLabelText("이름")).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "열기" }));
    expect(getName()).toHaveValue("");
    expect(getPassword()).toHaveValue("");
    expect(getSubmit()).toBeDisabled();
  });

  it("errorMessage가 있으면 비밀번호 입력란 아래에 안내를 보여주고 시트를 닫지 않는다", () => {
    render(<Harness errorMessage="일치하는 보탬이 없어요" />);

    expect(screen.getByText("일치하는 보탬이 없어요")).toBeInTheDocument();
    expect(getPassword()).toBeInvalid();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("확인 요청 중(isPending)에는 입력을 채워도 확인이 비활성이고 Enter로도 제출되지 않는다", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<Harness isPending onSubmit={onSubmit} />);

    await user.type(getName(), "민지");
    await user.type(getPassword(), "1234{Enter}");

    expect(getSubmit()).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
