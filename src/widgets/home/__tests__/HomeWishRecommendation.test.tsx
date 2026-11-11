import { render, screen } from "@testing-library/react";

import type { HomeWishCardResponse } from "@/types/home/home";
import HomeWishRecommendation from "@/widgets/home/HomeWishRecommendation";

const makeWish = (wishId: number): HomeWishCardResponse => ({
  wishId,
  productName: `상품${wishId}`,
  productImageUrl: `/wish-${wishId}.png`,
  price: wishId * 10000,
  productUrl: "https://example.com",
});

describe("HomeWishRecommendation", () => {
  it("닉네임 제목과 안내 문구를 보여준다", () => {
    render(<HomeWishRecommendation nickname="지유" wishes={[makeWish(1)]} />);

    expect(screen.getByText("지유님, 펀딩 열어볼까요?")).toBeInTheDocument();
    expect(screen.getByText("담아둔 위시로 바로 열 수 있어요")).toBeInTheDocument();
  });

  it("위시 수만큼 상품명·가격·'펀딩 열기' 버튼이 있는 카드를 보여준다", () => {
    render(<HomeWishRecommendation nickname="지유" wishes={[makeWish(1), makeWish(2)]} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("상품1")).toBeInTheDocument();
    expect(screen.getByText("20,000원")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "펀딩 열기" })).toHaveLength(2);
  });

  it("위시가 빈 배열이면 카드를 보여주지 않는다", () => {
    render(<HomeWishRecommendation nickname="지유" wishes={[]} />);

    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
