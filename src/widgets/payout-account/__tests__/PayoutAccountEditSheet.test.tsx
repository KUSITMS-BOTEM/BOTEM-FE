import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { usePayoutAccountsQuery } from "@/hooks/queries/payout-account/usePayoutAccountsQuery";
import PayoutAccountEditSheet from "@/widgets/payout-account/PayoutAccountEditSheet";

vi.mock("@/hooks/queries/payout-account/usePayoutAccountsQuery");

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(usePayoutAccountsQuery).mockReturnValue({
    data: [
      {
        id: 1,
        bank: "TOSS_BANK",
        bankName: "토스뱅크",
        accountNumber: "100159014821",
        accountHolder: "지유",
        isDefault: true,
        verificationStatus: "UNVERIFIED",
      },
    ],
  } as unknown as ReturnType<typeof usePayoutAccountsQuery>);
});

const getButtons = () => ({
  reset: screen.getByRole("button", { name: "계좌 되돌리기" }),
  submit: screen.getByRole("button", { name: "수정 완료" }),
});

describe("PayoutAccountEditSheet", () => {
  it("대표 계좌로 채우고, 바꾸기 전에는 되돌리기·수정 완료가 비활성이다", () => {
    render(<PayoutAccountEditSheet open onClose={vi.fn()} />);

    expect(screen.getByLabelText("계좌번호")).toHaveValue("100159014821");
    expect(screen.getByText("토스뱅크")).toBeInTheDocument();
    expect(getButtons().reset).toBeDisabled();
    expect(getButtons().submit).toBeDisabled();
  });

  it("계좌번호를 바꾸면 둘 다 활성이 되고, 되돌리면 원래 값과 비활성으로 돌아간다", async () => {
    render(<PayoutAccountEditSheet open onClose={vi.fn()} />);
    const input = screen.getByLabelText("계좌번호");

    await userEvent.clear(input);
    await userEvent.type(input, "123456789012");
    expect(getButtons().reset).toBeEnabled();
    expect(getButtons().submit).toBeEnabled();

    await userEvent.click(getButtons().reset);
    expect(input).toHaveValue("100159014821");
    expect(getButtons().reset).toBeDisabled();
    expect(getButtons().submit).toBeDisabled();
  });

  it("계좌번호 형식이 틀리면 수정 완료만 비활성이다", async () => {
    render(<PayoutAccountEditSheet open onClose={vi.fn()} />);
    const input = screen.getByLabelText("계좌번호");

    await userEvent.clear(input);
    await userEvent.type(input, "12");

    expect(getButtons().reset).toBeEnabled();
    expect(getButtons().submit).toBeDisabled();
  });

  it("수정하다 닫으면 원래 대표 계좌로 되돌린 뒤 onClose를 호출한다", async () => {
    const onClose = vi.fn();
    render(<PayoutAccountEditSheet open onClose={onClose} />);
    const input = screen.getByLabelText("계좌번호");

    await userEvent.clear(input);
    await userEvent.type(input, "123456789012");
    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalled();
    expect(input).toHaveValue("100159014821");
  });
});
