import { render, screen } from "@testing-library/react";

import FundingOriginalGiftSheet from "@/widgets/funding/FundingOriginalGiftSheet";

const originalGift = {
  productName: "Airpods Max Pro 3",
  price: 429000,
  productImageUrl: "https://example.com/max.png",
};

describe("FundingOriginalGiftSheet", () => {
  it("모인 금액과 기존 선물, 더 보태야 할 금액을 보여준다", () => {
    render(
      <FundingOriginalGiftSheet
        open
        collectedAmount={301000}
        originalGift={originalGift}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("총 301,000원이 모였어요")).toBeInTheDocument();
    expect(
      screen.getByText("기존 선물은 128,000원만 더 보태면 구매할 수 있어요"),
    ).toBeInTheDocument();
    expect(screen.getByText("Airpods Max Pro 3")).toBeInTheDocument();
    expect(screen.getByText("기존 선물")).toBeInTheDocument();
  });

  it("모인 금액으로 살 수 있으면 더 보태라는 안내를 숨긴다", () => {
    render(
      <FundingOriginalGiftSheet
        open
        collectedAmount={500000}
        originalGift={originalGift}
        onClose={vi.fn()}
      />,
    );

    expect(screen.queryByText(/더 보태면 구매할 수 있어요/)).not.toBeInTheDocument();
  });
});
