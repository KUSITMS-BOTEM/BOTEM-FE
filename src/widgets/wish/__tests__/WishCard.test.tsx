import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import WishCard from "@/widgets/wish/WishCard";

const baseProps = {
  productName: "머그컵 세트",
  price: 39000,
  productImageUrl: "/sample.png",
};

describe("WishCard", () => {
  it("상품명과 상품 이미지를 표시한다", () => {
    render(<WishCard {...baseProps} />);

    expect(screen.getByText("머그컵 세트")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "머그컵 세트" })).toBeInTheDocument();
  });

  it("가격을 천 단위 쉼표와 '원'으로 표시한다", () => {
    render(<WishCard {...baseProps} />);

    expect(screen.getByText("39,000원")).toBeInTheDocument();
  });

  it("가격이 0이면 '0원'으로 표시한다", () => {
    render(<WishCard {...baseProps} price={0} />);

    expect(screen.getByText("0원")).toBeInTheDocument();
  });

  it("type이 funding이면 '펀딩 중' 배지를 표시하고 버튼은 없다", () => {
    render(<WishCard {...baseProps} type="funding" />);

    expect(screen.getByText("펀딩 중")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "펀딩 열기" })).not.toBeInTheDocument();
  });

  it("type을 지정하지 않으면 배지와 버튼이 모두 없다", () => {
    render(<WishCard {...baseProps} />);

    expect(screen.queryByText("펀딩 중")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "펀딩 열기" })).not.toBeInTheDocument();
  });

  it("type이 button이면 '펀딩 열기' 버튼을 표시하고 배지는 없다", () => {
    render(<WishCard {...baseProps} type="button" />);

    expect(screen.getByRole("button", { name: "펀딩 열기" })).toBeInTheDocument();
    expect(screen.queryByText("펀딩 중")).not.toBeInTheDocument();
  });

  it("'펀딩 열기' 버튼을 클릭하면 onOpenFunding이 호출된다", async () => {
    const handleOpenFunding = vi.fn();
    const user = userEvent.setup();
    render(<WishCard {...baseProps} type="button" onOpenFunding={handleOpenFunding} />);

    await user.click(screen.getByRole("button", { name: "펀딩 열기" }));

    expect(handleOpenFunding).toHaveBeenCalledTimes(1);
  });
});
