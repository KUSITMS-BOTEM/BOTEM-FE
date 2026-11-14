import { render, screen } from "@testing-library/react";

import { useRecommendedProductQuery } from "@/hooks/queries/recommended-product/useRecommendedProductQuery";
import type { RecommendedProductResponse } from "@/types/recommended-product/recommendedProduct";
import FundingGiftChangeProductContainer from "@/widgets/funding/FundingGiftChangeProductContainer";

vi.mock("@/hooks/queries/recommended-product/useRecommendedProductQuery", () => ({
  useRecommendedProductQuery: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), back: vi.fn() }),
  useParams: () => ({ productId: "3" }),
  notFound: vi.fn(),
}));

const mockProduct: RecommendedProductResponse = {
  id: 3,
  name: "에어팟 프로 3",
  imageUrl: "https://example.com/airpods.png",
  price: 359000,
  sellerName: "쿠팡",
  category: "EARPHONE_HEADPHONE",
  status: "ON_SALE",
};

const mockProductQuery = (value: Partial<ReturnType<typeof useRecommendedProductQuery>>) => {
  vi.mocked(useRecommendedProductQuery).mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    refetch: vi.fn(),
    ...value,
  } as ReturnType<typeof useRecommendedProductQuery>);
};

describe("FundingGiftChangeProductContainer", () => {
  it("로딩 중에는 상품 정보 대신 스켈레톤을 보여준다", () => {
    mockProductQuery({ isLoading: true });
    render(<FundingGiftChangeProductContainer />);

    expect(screen.queryByText("에어팟 프로 3")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "이 상품으로 변경하기" })).not.toBeInTheDocument();
  });

  it("상품을 불러오면 '위시에 담기' 대신 '이 상품으로 변경하기' CTA를 보여준다", () => {
    mockProductQuery({ data: mockProduct });
    render(<FundingGiftChangeProductContainer />);

    expect(screen.getByText("에어팟 프로 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이 상품으로 변경하기" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "위시에 담기" })).not.toBeInTheDocument();
  });

  it("판매 종료 상품이면 고를 수 없다는 안내를 보여준다", () => {
    mockProductQuery({ data: { ...mockProduct, status: "DISCONTINUED" } });
    render(<FundingGiftChangeProductContainer />);

    expect(screen.getByText("지금은 고를 수 없는 선물이에요")).toBeInTheDocument();
  });

  it("상품 데이터가 없으면 불러오기 실패 안내를 보여준다", () => {
    mockProductQuery({ data: undefined });
    render(<FundingGiftChangeProductContainer />);

    expect(screen.getByText("상품 정보를 불러오지 못했어요")).toBeInTheDocument();
  });
});
