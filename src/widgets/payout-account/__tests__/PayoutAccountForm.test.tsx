import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { BankCode } from "@/constants/bank";
import PayoutAccountForm from "@/widgets/payout-account/PayoutAccountForm";

// jsdom 정적 이미지 처리와 dialog 미구현 API를 단순 대체한다
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

function Harness({ initialBank = null }: { initialBank?: BankCode | null }) {
  const [accountNumber, setAccountNumber] = useState("");
  const [bank, setBank] = useState<BankCode | null>(initialBank);
  return (
    <PayoutAccountForm
      accountNumber={accountNumber}
      bank={bank}
      onAccountNumberChange={setAccountNumber}
      onBankChange={setBank}
    />
  );
}

describe("PayoutAccountForm", () => {
  it("제목과 계좌번호·은행 필드를 보여준다", () => {
    render(<Harness />);

    expect(screen.getByText(/받을 계좌를 넣어주세요/)).toBeInTheDocument();
    expect(screen.getByLabelText("계좌번호")).toHaveValue("");
    expect(screen.getByRole("button", { name: /은행/ })).toBeInTheDocument();
  });

  it("계좌번호에는 숫자만 입력된다", async () => {
    render(<Harness />);

    await userEvent.type(screen.getByLabelText("계좌번호"), "10-0a15");

    expect(screen.getByLabelText("계좌번호")).toHaveValue("10015");
  });

  it("전달받은 은행의 이름을 은행 필드에 보여준다", () => {
    render(<Harness initialBank="TOSS_BANK" />);

    expect(screen.getByRole("button", { name: /은행.*토스뱅크/ })).toBeInTheDocument();
  });

  it("은행 필드를 눌러 은행을 고르면 선택한 은행이 반영된다", async () => {
    render(<Harness />);

    await userEvent.click(screen.getByRole("button", { name: /^은행/ }));
    await userEvent.click(await screen.findByRole("button", { name: /카카오뱅크/ }));

    expect(screen.getByRole("button", { name: /^은행.*카카오뱅크/ })).toBeInTheDocument();
  });
});
