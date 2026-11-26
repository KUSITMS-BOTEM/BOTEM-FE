import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { WishResponse } from "@/types/wish/wish";
import FundingConfirmSheet from "@/widgets/funding/FundingConfirmSheet";

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
  id: 1,
  productName: "소니 WH-1000XM5",
  productImageUrl: "https://example.com/1.png",
  price: 468000,
  productUrl: "https://example.com",
  sellerName: "쿠팡 Apple 공식 브랜드관",
  status: "AVAILABLE",
  fundingId: null,
};
const amount = { targetAmount: "429000", recommendedAmount: "50000" };
const info = { deadline: "2099-11-13", story: "생일이에요", pledge: "" };
const account = { accountNumber: "100159014821", bank: "TOSS_BANK" } as const;

const renderSheet = (props = {}) =>
  render(
    <FundingConfirmSheet
      open
      wish={wish}
      amount={amount}
      info={info}
      account={account}
      onClose={vi.fn()}
      onConfirm={vi.fn()}
      onPreview={vi.fn()}
      onEditAmount={vi.fn()}
      onEditInfo={vi.fn()}
      onEditAccount={vi.fn()}
      {...props}
    />,
  );

describe("FundingConfirmSheet", () => {
  it("입력한 펀딩 정보와 계좌를 보여준다", () => {
    renderSheet();

    expect(screen.getByText("이대로 펀딩을 열까요?")).toBeInTheDocument();
    expect(screen.getByText("소니 WH-1000XM5")).toBeInTheDocument();
    expect(screen.getByText("429,000원")).toBeInTheDocument();
    expect(screen.getByText("한 명당 50,000원씩")).toBeInTheDocument();
    expect(screen.getByText("11월 13일")).toBeInTheDocument();
    expect(screen.getByText("생일이에요")).toBeInTheDocument();
    expect(screen.getByText("토스뱅크")).toBeInTheDocument();
    expect(screen.getByText("100159014821")).toBeInTheDocument();
  });

  it("추천 금액이 없으면 추천 금액 행을 보여주지 않는다", () => {
    renderSheet({ amount: { targetAmount: "429000", recommendedAmount: "" } });
    expect(screen.queryByText("추천 금액")).not.toBeInTheDocument();
  });

  it("공약이 비어 있으면 공약 행을 보여주지 않는다", () => {
    renderSheet();
    expect(screen.queryByText("공약")).not.toBeInTheDocument();
  });

  it("공약이 있으면 공약 행을 보여준다", () => {
    renderSheet({ info: { ...info, pledge: "노래방 영상 올릴게요" } });
    expect(screen.getByText("노래방 영상 올릴게요")).toBeInTheDocument();
    expect(screen.getByText("공약")).toBeInTheDocument();
  });

  it("각 섹션의 변경하기를 누르면 해당 수정 콜백을 호출한다", async () => {
    const onEditAmount = vi.fn();
    const onEditInfo = vi.fn();
    const onEditAccount = vi.fn();
    renderSheet({ onEditAmount, onEditInfo, onEditAccount });

    const [amountButton, infoButton, accountButton] = screen.getAllByRole("button", {
      name: /변경하기/,
    });
    await userEvent.click(amountButton);
    await userEvent.click(infoButton);
    await userEvent.click(accountButton);

    expect(onEditAmount).toHaveBeenCalledTimes(1);
    expect(onEditInfo).toHaveBeenCalledTimes(1);
    expect(onEditAccount).toHaveBeenCalledTimes(1);
  });

  it("미리보기를 누르면 onPreview를 호출한다", async () => {
    const onPreview = vi.fn();
    renderSheet({ onPreview });

    await userEvent.click(screen.getByRole("button", { name: "미리보기" }));

    expect(onPreview).toHaveBeenCalledTimes(1);
  });
});
