import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FundingGiftChangeView, {
  type GiftChangeProduct,
} from "@/widgets/funding/FundingGiftChangeView";

const currentGift: GiftChangeProduct = {
  id: 1,
  productName: "에어팟 맥스",
  price: 329000,
  productImageUrl: "https://example.com/1.png",
};
const wish: GiftChangeProduct = {
  id: 2,
  productName: "르크루제 머그",
  price: 39000,
  productImageUrl: "https://example.com/2.png",
};

const renderView = (props: Partial<Parameters<typeof FundingGiftChangeView>[0]> = {}) => {
  const handlers = {
    onBack: vi.fn(),
    onSelectCurrentGift: vi.fn(),
    onSelectWish: vi.fn(),
    onBrowseProducts: vi.fn(),
  };
  render(
    <FundingGiftChangeView
      collectedAmount={301000}
      currentGift={currentGift}
      wishes={[wish]}
      {...handlers}
      {...props}
    />,
  );
  return handlers;
};

describe("FundingGiftChangeView", () => {
  it("모인 금액 타이틀과 기존 선물까지 부족한 금액 안내를 보여준다", () => {
    renderView();

    expect(screen.getByText(/모인 301,000원 안에서/)).toBeInTheDocument();
    expect(
      screen.getByText("기존 선물은 28,000원만 더 보태면 구매할 수 있어요"),
    ).toBeInTheDocument();
    expect(screen.getByText("기존 선물")).toBeInTheDocument();
  });

  it("기존 선물이 모인 금액보다 싸면 부족 금액을 0원으로 보여준다", () => {
    renderView({ currentGift: { ...currentGift, price: 200000 } });

    expect(screen.getByText("기존 선물은 0원만 더 보태면 구매할 수 있어요")).toBeInTheDocument();
  });

  it("위시 행에 모인 금액에서 위시 가격을 뺀 남는 금액을 보여준다", () => {
    renderView();

    expect(screen.getByText("위시에서 다른 상품 고르기")).toBeInTheDocument();
    expect(screen.getByText("남는 금액 262,000원")).toBeInTheDocument();
  });

  it("고를 위시가 없으면 위시 목록 섹션을 숨긴다", () => {
    renderView({ wishes: [] });

    expect(screen.queryByText("위시에서 다른 상품 고르기")).not.toBeInTheDocument();
    expect(screen.getByText("위시 상품을 찾아볼까요?")).toBeInTheDocument();
  });

  it("선택 버튼을 누르면 해당 선물의 콜백이 호출된다", async () => {
    const user = userEvent.setup();
    const { onSelectCurrentGift, onSelectWish } = renderView();

    await user.click(screen.getByRole("button", { name: "에어팟 맥스 선택" }));
    await user.click(screen.getByRole("button", { name: "르크루제 머그 선택" }));

    expect(onSelectCurrentGift).toHaveBeenCalledTimes(1);
    expect(onSelectWish).toHaveBeenCalledWith(wish);
  });

  it("'상품 보기'를 누르면 onBrowseProducts가 호출된다", async () => {
    const user = userEvent.setup();
    const { onBrowseProducts } = renderView();

    await user.click(screen.getByRole("button", { name: /상품 보기/ }));

    expect(onBrowseProducts).toHaveBeenCalledTimes(1);
  });
});
