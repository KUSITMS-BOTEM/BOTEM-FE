import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { usePayoutAccountsQuery } from "@/hooks/queries/payout-account/usePayoutAccountsQuery";
import type { PayoutAccountResponse } from "@/types/payout-account/payoutAccount";
import FundingAccountStep from "@/widgets/funding/FundingAccountStep";

vi.mock("@/hooks/queries/payout-account/usePayoutAccountsQuery");

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

const account = (overrides: Partial<PayoutAccountResponse>): PayoutAccountResponse => ({
  id: 1,
  bank: "TOSS_BANK",
  bankName: "토스뱅크",
  accountNumber: "100159014821",
  accountHolder: null,
  isDefault: true,
  verificationStatus: "UNVERIFIED",
  ...overrides,
});

const mockAccounts = (data: PayoutAccountResponse[] | undefined) =>
  vi
    .mocked(usePayoutAccountsQuery)
    .mockReturnValue({ data } as unknown as ReturnType<typeof usePayoutAccountsQuery>);

describe("FundingAccountStep", () => {
  it("계좌 정보가 비어 있으면 펀딩 열기가 비활성화된다", () => {
    mockAccounts([]);
    render(<FundingAccountStep onSubmit={vi.fn()} onPrev={vi.fn()} />);

    expect(screen.getByRole("button", { name: "펀딩 열기" })).toBeDisabled();
  });

  it("대표 계좌의 계좌번호와 은행이 채워진 채로 열리고 펀딩 열기가 활성화된다", () => {
    mockAccounts([
      account({ id: 2, bank: "KAKAO_BANK", accountNumber: "3333", isDefault: false }),
      account({}),
    ]);
    render(<FundingAccountStep onSubmit={vi.fn()} onPrev={vi.fn()} />);

    expect(screen.getByLabelText("계좌번호")).toHaveValue("100159014821");
    expect(screen.getByRole("button", { name: /^은행.*토스뱅크/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "펀딩 열기" })).toBeEnabled();
  });

  it("대표 계좌가 없거나 아직 불러오지 못했으면 대표 계좌 사용하기가 비활성화된다", () => {
    mockAccounts([account({ isDefault: false })]);
    const { rerender } = render(<FundingAccountStep onSubmit={vi.fn()} onPrev={vi.fn()} />);
    expect(screen.getByRole("button", { name: /대표 계좌 사용하기/ })).toBeDisabled();

    mockAccounts(undefined);
    rerender(<FundingAccountStep onSubmit={vi.fn()} onPrev={vi.fn()} />);
    expect(screen.getByRole("button", { name: /대표 계좌 사용하기/ })).toBeDisabled();
  });

  it("입력된 은행과 계좌번호가 대표 계좌와 같으면 대표 계좌 사용하기가 비활성화되고, 바꾼 뒤 누르면 대표 계좌로 돌아온다", async () => {
    mockAccounts([account({})]);
    render(<FundingAccountStep onSubmit={vi.fn()} onPrev={vi.fn()} />);
    const useDefault = screen.getByRole("button", { name: "대표 계좌 사용하기" });
    expect(useDefault).toBeDisabled();

    await userEvent.type(screen.getByLabelText("계좌번호"), "9");
    await userEvent.click(useDefault);

    expect(screen.getByLabelText("계좌번호")).toHaveValue("100159014821");
    expect(useDefault).toBeDisabled();
  });

  it("대표 계좌를 늦게 불러와도 이미 입력한 값은 덮어쓰지 않는다", async () => {
    mockAccounts(undefined);
    const { rerender } = render(<FundingAccountStep onSubmit={vi.fn()} onPrev={vi.fn()} />);
    await userEvent.type(screen.getByLabelText("계좌번호"), "123");

    mockAccounts([account({})]);
    rerender(<FundingAccountStep onSubmit={vi.fn()} onPrev={vi.fn()} />);

    expect(screen.getByLabelText("계좌번호")).toHaveValue("123");
  });

  it("대표 계좌를 늦게 불러오면 비어 있는 입력에 채운다", () => {
    mockAccounts(undefined);
    const { rerender } = render(<FundingAccountStep onSubmit={vi.fn()} onPrev={vi.fn()} />);

    mockAccounts([account({})]);
    rerender(<FundingAccountStep onSubmit={vi.fn()} onPrev={vi.fn()} />);

    expect(screen.getByLabelText("계좌번호")).toHaveValue("100159014821");
  });

  it("대표 계좌를 불러오기 전에 입력한 값을 지워도 대표 계좌로 다시 채우지 않는다", async () => {
    mockAccounts(undefined);
    const { rerender } = render(<FundingAccountStep onSubmit={vi.fn()} onPrev={vi.fn()} />);
    await userEvent.type(screen.getByLabelText("계좌번호"), "123");
    mockAccounts([account({})]);
    rerender(<FundingAccountStep onSubmit={vi.fn()} onPrev={vi.fn()} />);

    await userEvent.clear(screen.getByLabelText("계좌번호"));

    expect(screen.getByLabelText("계좌번호")).toHaveValue("");
  });

  it("대표 계좌를 불러오기 전에 입력했다가 지우면 불러온 뒤에도 채우지 않는다", async () => {
    mockAccounts(undefined);
    const { rerender } = render(<FundingAccountStep onSubmit={vi.fn()} onPrev={vi.fn()} />);
    await userEvent.type(screen.getByLabelText("계좌번호"), "123");
    await userEvent.clear(screen.getByLabelText("계좌번호"));

    mockAccounts([account({})]);
    rerender(<FundingAccountStep onSubmit={vi.fn()} onPrev={vi.fn()} />);

    expect(screen.getByLabelText("계좌번호")).toHaveValue("");
  });

  it("이전을 누르면 onPrev를 호출한다", async () => {
    mockAccounts([]);
    const onPrev = vi.fn();
    render(<FundingAccountStep onSubmit={vi.fn()} onPrev={onPrev} />);

    await userEvent.click(screen.getByRole("button", { name: "이전" }));

    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it("펀딩 열기를 누르면 입력한 값으로 onSubmit을 호출한다", async () => {
    mockAccounts([account({})]);
    const onSubmit = vi.fn();
    render(<FundingAccountStep onSubmit={onSubmit} onPrev={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "펀딩 열기" }));

    expect(onSubmit).toHaveBeenCalledWith({ accountNumber: "100159014821", bank: "TOSS_BANK" });
  });

  it("계좌번호 입력에 포커스가 있으면 터치 기기에서 CTA를 숨기고, 입력란이 아닌 곳으로 포커스가 옮겨지면 다시 보인다", async () => {
    mockAccounts([]);
    render(<FundingAccountStep onSubmit={vi.fn()} onPrev={vi.fn()} />);
    const cta = screen.getByRole("button", { name: "펀딩 열기" }).closest(".fixed");

    expect(cta).not.toHaveClass("pointer-coarse:hidden");
    await userEvent.click(screen.getByLabelText("계좌번호"));
    expect(cta).toHaveClass("pointer-coarse:hidden");
    act(() => screen.getByRole("button", { name: "복사한 계좌 붙여넣기" }).focus());
    expect(cta).not.toHaveClass("pointer-coarse:hidden");
  });

  describe("수정 모드", () => {
    const initialValues = { accountNumber: "100159014821", bank: "TOSS_BANK" } as const;

    it("값이 채워져 있고 이전 버튼 없이 수정 완료가 비활성화돼 있다", () => {
      mockAccounts([]);
      render(
        <FundingAccountStep
          onSubmit={vi.fn()}
          initialValues={initialValues}
          submitLabel="수정 완료"
        />,
      );

      expect(screen.getByLabelText("계좌번호")).toHaveValue("100159014821");
      expect(screen.queryByRole("button", { name: "이전" })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "수정 완료" })).toBeDisabled();
    });

    it("계좌번호를 바꾸면 수정 완료가 활성화되고 누르면 바뀐 값으로 onSubmit을 호출한다", async () => {
      mockAccounts([]);
      const onSubmit = vi.fn();
      render(
        <FundingAccountStep
          onSubmit={onSubmit}
          initialValues={initialValues}
          submitLabel="수정 완료"
        />,
      );

      await userEvent.type(screen.getByLabelText("계좌번호"), "9");
      await userEvent.click(screen.getByRole("button", { name: "수정 완료" }));

      expect(onSubmit).toHaveBeenCalledWith({ accountNumber: "1001590148219", bank: "TOSS_BANK" });
    });
  });
});
