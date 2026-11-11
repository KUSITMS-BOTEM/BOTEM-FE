import { render, screen } from "@testing-library/react";
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
    mockAccounts([account({})]);
    render(<FundingAccountStep onPrev={vi.fn()} />);

    expect(screen.getByRole("button", { name: "펀딩 열기" })).toBeDisabled();
  });

  it("대표 계좌 사용하기를 누르면 대표 계좌의 계좌번호와 은행이 채워지고 펀딩 열기가 활성화된다", async () => {
    mockAccounts([
      account({ id: 2, bank: "KAKAO_BANK", accountNumber: "3333", isDefault: false }),
      account({}),
    ]);
    render(<FundingAccountStep onPrev={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: /대표 계좌 사용하기/ }));

    expect(screen.getByLabelText("계좌번호")).toHaveValue("100159014821");
    expect(screen.getByRole("button", { name: /^은행.*토스뱅크/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "펀딩 열기" })).toBeEnabled();
  });

  it("대표 계좌가 없거나 아직 불러오지 못했으면 대표 계좌 사용하기가 비활성화된다", () => {
    mockAccounts([account({ isDefault: false })]);
    const { rerender } = render(<FundingAccountStep onPrev={vi.fn()} />);
    expect(screen.getByRole("button", { name: /대표 계좌 사용하기/ })).toBeDisabled();

    mockAccounts(undefined);
    rerender(<FundingAccountStep onPrev={vi.fn()} />);
    expect(screen.getByRole("button", { name: /대표 계좌 사용하기/ })).toBeDisabled();
  });

  it("이전을 누르면 onPrev를 호출한다", async () => {
    mockAccounts([]);
    const onPrev = vi.fn();
    render(<FundingAccountStep onPrev={onPrev} />);

    await userEvent.click(screen.getByRole("button", { name: "이전" }));

    expect(onPrev).toHaveBeenCalledTimes(1);
  });
});
