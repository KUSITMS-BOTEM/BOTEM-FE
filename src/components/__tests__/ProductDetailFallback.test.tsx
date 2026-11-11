import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ProductDetailFallback from "@/components/ProductDetailFallback";

const baseProps = {
  message: "상품 정보를 불러오지 못했습니다.",
  onBack: vi.fn(),
};

describe("ProductDetailFallback", () => {
  it("message prop을 그대로 렌더한다", () => {
    render(<ProductDetailFallback {...baseProps} />);

    expect(screen.getByText("상품 정보를 불러오지 못했습니다.")).toBeInTheDocument();
  });

  it("뒤로 가기 버튼 클릭 시 onBack이 호출된다", async () => {
    const handleBack = vi.fn();
    const user = userEvent.setup();
    render(<ProductDetailFallback {...baseProps} onBack={handleBack} />);

    await user.click(screen.getByRole("button", { name: "뒤로 가기" }));

    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it("onRetry가 없으면 '다시 시도' 버튼이 렌더되지 않는다", () => {
    render(<ProductDetailFallback {...baseProps} />);

    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
  });

  it("onRetry가 있으면 '다시 시도' 버튼이 렌더되고 클릭 시 호출된다", async () => {
    const handleRetry = vi.fn();
    const user = userEvent.setup();
    render(<ProductDetailFallback {...baseProps} onRetry={handleRetry} />);

    await user.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
