import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ProductDetailView from "@/components/ProductDetailView";

const baseProps = {
  productImageUrl: "https://example.com/airpods.png",
  productName: "에어팟 프로",
  price: 359000,
  sellerName: "애플",
  onBack: vi.fn(),
  ctaLabel: "위시에 담기",
};

describe("ProductDetailView", () => {
  it("상품명, 상품 이미지, 판매처명을 렌더한다", () => {
    render(<ProductDetailView {...baseProps} />);

    expect(screen.getByText("에어팟 프로")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "에어팟 프로" })).toBeInTheDocument();
    expect(screen.getByText("애플")).toBeInTheDocument();
  });

  it("price를 ko-KR 천 단위 쉼표와 '원'으로 표시한다", () => {
    render(<ProductDetailView {...baseProps} />);

    expect(screen.getByText("359,000원")).toBeInTheDocument();
  });

  it("price가 0이면 '0원'을 표시한다", () => {
    render(<ProductDetailView {...baseProps} price={0} />);

    expect(screen.getByText("0원")).toBeInTheDocument();
  });

  it("onSellerClick이 없으면 판매처 영역이 버튼으로 렌더되지 않는다", () => {
    render(<ProductDetailView {...baseProps} />);

    expect(screen.queryByRole("button", { name: /애플/ })).not.toBeInTheDocument();
  });

  it("onSellerClick이 있으면 판매처 영역이 클릭 가능한 버튼으로 렌더되고 클릭 시 호출된다", async () => {
    const handleSellerClick = vi.fn();
    const user = userEvent.setup();
    render(<ProductDetailView {...baseProps} onSellerClick={handleSellerClick} />);

    const sellerButton = screen.getByRole("button", { name: /애플/ });
    await user.click(sellerButton);

    expect(handleSellerClick).toHaveBeenCalledTimes(1);
  });

  it("뒤로 가기 버튼 클릭 시 onBack이 호출된다", async () => {
    const handleBack = vi.fn();
    const user = userEvent.setup();
    render(<ProductDetailView {...baseProps} onBack={handleBack} />);

    await user.click(screen.getByRole("button", { name: "뒤로 가기" }));

    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it("ctaLabel을 CTA 버튼 텍스트로 렌더한다", () => {
    render(<ProductDetailView {...baseProps} ctaLabel="펀딩 시작하기" />);

    expect(screen.getByRole("button", { name: "펀딩 시작하기" })).toBeInTheDocument();
  });

  it("CTA 버튼 클릭 시 onCtaClick이 호출된다", async () => {
    const handleCtaClick = vi.fn();
    const user = userEvent.setup();
    render(<ProductDetailView {...baseProps} onCtaClick={handleCtaClick} />);

    await user.click(screen.getByRole("button", { name: "위시에 담기" }));

    expect(handleCtaClick).toHaveBeenCalledTimes(1);
  });

  it("ctaPending이 true면 CTA 버튼이 비활성화된다", () => {
    render(<ProductDetailView {...baseProps} ctaPending />);

    expect(screen.getByRole("button", { name: "위시에 담기" })).toBeDisabled();
  });

  it("ctaPending 기본값에서는 CTA 버튼이 비활성화되지 않는다", () => {
    render(<ProductDetailView {...baseProps} />);

    expect(screen.getByRole("button", { name: "위시에 담기" })).not.toBeDisabled();
  });

  it("rightItems가 있으면 해당 아이콘 버튼이 헤더에 렌더된다", () => {
    render(
      <ProductDetailView
        {...baseProps}
        rightItems={[{ icon: <span />, ariaLabel: "문의하기", onClick: vi.fn() }]}
      />,
    );

    const header = screen.getByRole("banner");
    expect(within(header).getByRole("button", { name: "문의하기" })).toBeInTheDocument();
  });

  it("rightItems가 없으면 헤더에 뒤로 가기 버튼만 렌더된다", () => {
    render(<ProductDetailView {...baseProps} />);

    const header = screen.getByRole("banner");
    expect(within(header).getAllByRole("button")).toHaveLength(1);
  });
});
