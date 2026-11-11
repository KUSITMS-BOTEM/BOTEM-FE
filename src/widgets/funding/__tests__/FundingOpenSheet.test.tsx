import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { usePayoutAccountsQuery } from "@/hooks/queries/payout-account/usePayoutAccountsQuery";
import { useWishesQuery } from "@/hooks/queries/wish/useWishesQuery";
import type { WishResponse } from "@/types/wish/wish";
import FundingOpenSheet from "@/widgets/funding/FundingOpenSheet";

vi.mock("@/hooks/queries/wish/useWishesQuery");
vi.mock("@/hooks/queries/payout-account/usePayoutAccountsQuery", () => ({
  usePayoutAccountsQuery: vi.fn(() => ({ data: [] })),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

// jsdom 정적 이미지 처리와 dialog 미구현 API를 단순 대체한다
vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
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

const wish: WishResponse = {
  id: 468,
  productName: "상품468",
  productImageUrl: "https://example.com/468.png",
  price: 468000,
  productUrl: "https://example.com",
  status: "AVAILABLE",
  fundingId: null,
};

const mockWishes = () =>
  vi.mocked(useWishesQuery).mockReturnValue({
    data: { content: [wish], page: 0, size: 10, totalElements: 1, hasNext: false },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useWishesQuery>);

function Harness() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button onClick={() => setOpen(true)}>열기</button>
      <FundingOpenSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}

describe("FundingOpenSheet", () => {
  beforeEach(mockWishes);

  it("처음에는 펀딩 열기 제목과 위시 선택 화면을 보여준다", () => {
    render(<Harness />);

    expect(screen.getByText("펀딩 열기")).toBeInTheDocument();
    expect(screen.getByText("내 위시에서 고르기")).toBeInTheDocument();
  });

  it("위시를 선택하면 제목이 펀딩 정보로 바뀌고 목표 금액 입력 화면으로 교체된다", async () => {
    render(<Harness />);

    await userEvent.click(screen.getByRole("button", { name: /상품468/ }));

    expect(await screen.findByText("펀딩 정보")).toBeInTheDocument();
    expect(screen.queryByText("펀딩 열기")).not.toBeInTheDocument();
    expect(screen.queryByText("내 위시에서 고르기")).not.toBeInTheDocument();
    expect(screen.getByLabelText("목표 금액")).toHaveValue("");
  });

  it("시트를 닫았다 다시 열면 위시 선택부터 다시 시작한다", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: /상품468/ }));
    await screen.findByText("펀딩 정보");

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));
    await userEvent.click(screen.getByRole("button", { name: "열기", hidden: true }));

    expect(await screen.findByText("펀딩 열기")).toBeInTheDocument();
    expect(screen.getByText("내 위시에서 고르기")).toBeInTheDocument();
  });

  describe("펀딩 정보 → 계좌 정보 단계", () => {
    const goToAccountStep = async () => {
      const { container } = render(<Harness />);
      await userEvent.click(screen.getByRole("button", { name: /상품468/ }));
      await userEvent.type(await screen.findByLabelText("목표 금액"), "1000");
      await userEvent.tab();
      const dateInput = container.querySelector<HTMLInputElement>('input[type="date"]')!;
      fireEvent.change(dateInput, { target: { value: "2099-12-25" } });
      fireEvent.blur(dateInput);
      const story = screen.getByLabelText("사연");
      await userEvent.type(story, "생일 선물");
      fireEvent.blur(story);
      await userEvent.click(screen.getByRole("button", { name: "다음" }));
    };

    it("다음을 누르면 제목이 계좌 정보로 바뀌고 계좌 입력 화면이 나타난다", async () => {
      await goToAccountStep();

      expect(await screen.findByText("계좌 정보")).toBeInTheDocument();
      expect(screen.getByLabelText("계좌번호")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "펀딩 열기" })).toBeInTheDocument();
      expect(usePayoutAccountsQuery).toHaveBeenCalled();
    });

    it("이전을 누르면 펀딩 정보로 돌아오고 입력했던 값이 그대로 남아 있다", async () => {
      await goToAccountStep();
      await userEvent.click(await screen.findByRole("button", { name: "이전" }));

      expect(screen.getByText("펀딩 정보")).toBeInTheDocument();
      expect(screen.getByLabelText("사연")).toHaveValue("생일 선물");
      expect(screen.getByLabelText("목표 금액")).toHaveValue("1,000");
    });

    it("계좌 단계에 들어가기 전에는 대표 계좌를 조회하지 않는다", async () => {
      vi.mocked(usePayoutAccountsQuery).mockClear();
      render(<Harness />);
      await userEvent.click(screen.getByRole("button", { name: /상품468/ }));
      await screen.findByText("펀딩 정보");

      expect(usePayoutAccountsQuery).not.toHaveBeenCalled();
    });
  });

  it("open이 false면 위시를 조회하지 않는다", () => {
    vi.mocked(useWishesQuery).mockClear();

    render(<FundingOpenSheet open={false} onClose={vi.fn()} />);

    expect(useWishesQuery).not.toHaveBeenCalled();
  });
});
