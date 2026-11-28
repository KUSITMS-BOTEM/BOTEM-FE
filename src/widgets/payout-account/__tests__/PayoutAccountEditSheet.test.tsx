import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useUpdatePayoutAccountMutation } from "@/hooks/mutations/payout-account/useUpdatePayoutAccountMutation";
import { usePayoutAccountsQuery } from "@/hooks/queries/payout-account/usePayoutAccountsQuery";
import PayoutAccountEditSheet from "@/widgets/payout-account/PayoutAccountEditSheet";

vi.mock("@/hooks/queries/payout-account/usePayoutAccountsQuery");
vi.mock("@/hooks/mutations/payout-account/useUpdatePayoutAccountMutation");

const mutate = vi.fn();

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
  vi.mocked(useUpdatePayoutAccountMutation).mockReturnValue({
    mutate,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdatePayoutAccountMutation>);
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

  it("수정 완료를 누르면 대표 계좌 id와 바꾼 값으로 수정을 요청하고, 성공하면 닫는다", async () => {
    const onClose = vi.fn();
    mutate.mockImplementation((_vars, options) => options.onSuccess({ id: 1 }));
    render(<PayoutAccountEditSheet open onClose={onClose} />);
    const input = screen.getByLabelText("계좌번호");

    await userEvent.clear(input);
    await userEvent.type(input, "123456789012");
    await userEvent.click(getButtons().submit);

    expect(mutate).toHaveBeenCalledWith(
      { accountId: 1, bank: "TOSS_BANK", accountNumber: "123456789012", accountHolder: "지유" },
      expect.any(Object),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("요청이 실패하면 시트를 닫지 않고 입력값을 유지한다", async () => {
    const onClose = vi.fn();
    mutate.mockImplementation(() => undefined);
    render(<PayoutAccountEditSheet open onClose={onClose} />);
    const input = screen.getByLabelText("계좌번호");

    await userEvent.clear(input);
    await userEvent.type(input, "123456789012");
    await userEvent.click(getButtons().submit);

    expect(onClose).not.toHaveBeenCalled();
    expect(input).toHaveValue("123456789012");
  });

  it("응답이 비어 있어도 성공하면 닫고, 다시 열었을 때 바꾼 값이 기준이 된다", async () => {
    const onClose = vi.fn();
    mutate.mockImplementation((_vars, options) => options.onSuccess(null));
    render(<PayoutAccountEditSheet open onClose={onClose} />);
    const input = screen.getByLabelText("계좌번호");

    await userEvent.clear(input);
    await userEvent.type(input, "123456789012");
    await userEvent.click(getButtons().submit);

    expect(onClose).toHaveBeenCalled();
    expect(input).toHaveValue("123456789012");
    expect(getButtons().submit).toBeDisabled();
  });

  it("요청 중 입력을 바꿔도 성공하면 입력이 저장된 계좌로 맞춰진다", async () => {
    let onSuccess: (updated: unknown) => void = () => undefined;
    mutate.mockImplementation((_vars, options) => {
      onSuccess = options.onSuccess;
    });
    render(<PayoutAccountEditSheet open onClose={vi.fn()} />);
    const input = screen.getByLabelText("계좌번호");

    await userEvent.clear(input);
    await userEvent.type(input, "123456789012");
    await userEvent.click(getButtons().submit);
    await userEvent.click(getButtons().reset);
    expect(input).toHaveValue("100159014821");

    act(() =>
      onSuccess({
        id: 1,
        bank: "TOSS_BANK",
        bankName: "토스뱅크",
        accountNumber: "123456789012",
        accountHolder: "지유",
        isDefault: true,
        verificationStatus: "UNVERIFIED",
      }),
    );

    expect(input).toHaveValue("123456789012");
    expect(getButtons().submit).toBeDisabled();
  });

  it("계좌번호 입력에 포커스가 있으면 터치 기기에서 CTA를 숨기고, 입력란이 아닌 곳으로 포커스가 옮겨지면 다시 보인다", async () => {
    render(<PayoutAccountEditSheet open onClose={vi.fn()} />);
    const cta = getButtons().submit.closest(".fixed");

    expect(cta).not.toHaveClass("pointer-coarse:hidden");
    await userEvent.click(screen.getByLabelText("계좌번호"));
    expect(cta).toHaveClass("pointer-coarse:hidden");
    act(() => screen.getByRole("button", { name: "복사한 계좌 붙여넣기" }).focus());
    expect(cta).not.toHaveClass("pointer-coarse:hidden");
  });

  it("입력 중에 닫았다가 다시 열면 CTA가 보인다", async () => {
    const { rerender } = render(<PayoutAccountEditSheet open onClose={vi.fn()} />);
    await userEvent.click(screen.getByLabelText("계좌번호"));
    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    rerender(<PayoutAccountEditSheet open={false} onClose={vi.fn()} />);
    rerender(<PayoutAccountEditSheet open onClose={vi.fn()} />);

    expect(getButtons().submit.closest(".fixed")).not.toHaveClass("pointer-coarse:hidden");
  });

  describe("요청 중일 때", () => {
    beforeEach(() => {
      vi.mocked(useUpdatePayoutAccountMutation).mockReturnValue({
        mutate,
        isPending: true,
      } as unknown as ReturnType<typeof useUpdatePayoutAccountMutation>);
    });

    it("수정 완료 버튼이 loading 상태로 눌리지 않는다", () => {
      render(<PayoutAccountEditSheet open onClose={vi.fn()} />);

      expect(getButtons().submit).toHaveAttribute("aria-busy", "true");
      expect(getButtons().submit).toBeDisabled();
    });

    it("닫기를 눌러도 시트를 닫지 않고 입력값을 유지한다", async () => {
      const onClose = vi.fn();
      render(<PayoutAccountEditSheet open onClose={onClose} />);
      const input = screen.getByLabelText("계좌번호");

      await userEvent.clear(input);
      await userEvent.type(input, "123456789012");
      await userEvent.click(screen.getByRole("button", { name: "닫기" }));

      expect(onClose).not.toHaveBeenCalled();
      expect(input).toHaveValue("123456789012");
    });
  });
});
