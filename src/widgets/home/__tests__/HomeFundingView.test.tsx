import { render, screen } from "@testing-library/react";

import type { FundingCardData } from "@/widgets/home/FundingCardCarousel";
import HomeFundingView from "@/widgets/home/HomeFundingView";

const makeCard = (id: number): FundingCardData => ({
  id,
  title: `펀딩${id}`,
  productName: `상품${id}`,
  productImageUrl: `/product-${id}.png`,
  progress: 50,
  dDay: 7,
  targetAmount: 100000,
});

describe("HomeFundingView", () => {
  it("제목과 첫 번째 펀딩 카드를 보여준다", () => {
    render(<HomeFundingView cards={[makeCard(1), makeCard(2)]} />);

    expect(screen.getByText("작은 보탬들이 차곡차곡 쌓이고 있어요")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "2개 중 1번째" })).toHaveTextContent("펀딩1");
  });
});
