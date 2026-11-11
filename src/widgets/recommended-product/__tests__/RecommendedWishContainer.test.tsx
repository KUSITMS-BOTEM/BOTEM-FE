import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useRecommendedProductsQuery } from "@/hooks/queries/recommended-product/useRecommendedProductsQuery";
import type { RecommendedProductResponse } from "@/types/recommended-product/recommendedProduct";
import RecommendedWishContainer from "@/widgets/recommended-product/RecommendedWishContainer";

vi.mock("@/hooks/queries/recommended-product/useRecommendedProductsQuery", () => ({
  useRecommendedProductsQuery: vi.fn(),
}));

const push = vi.fn();
const back = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, back }),
}));

const mockProducts: RecommendedProductResponse[] = [
  {
    id: 3,
    name: "에어팟 프로 3",
    imageUrl: "https://example.com/airpods.png",
    price: 359000,
    sellerName: "쿠팡",
    category: "EARPHONE_HEADPHONE",
    status: "ON_SALE",
  },
  {
    id: 5,
    name: "향수",
    imageUrl: "https://example.com/perfume.png",
    price: 89000,
    sellerName: "쿠팡",
    category: "PERFUME",
    status: "ON_SALE",
  },
];

const refetch = vi.fn();

const mockProductsQuery = (value: Partial<ReturnType<typeof useRecommendedProductsQuery>>) => {
  vi.mocked(useRecommendedProductsQuery).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch,
    ...value,
  } as ReturnType<typeof useRecommendedProductsQuery>);
};

describe("RecommendedWishContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("각 추천 상품 카드는 해당 상품 상세 경로로 연결된다", () => {
    mockProductsQuery({ data: mockProducts });

    render(<RecommendedWishContainer />);

    expect(screen.getByRole("link", { name: /에어팟 프로 3/ })).toHaveAttribute(
      "href",
      "/wish/recommended/3",
    );
    expect(screen.getByRole("link", { name: /향수/ })).toHaveAttribute(
      "href",
      "/wish/recommended/5",
    );
  });

  it("로딩 중이면 상품 카드를 렌더하지 않는다", () => {
    mockProductsQuery({ isLoading: true });

    render(<RecommendedWishContainer />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("조회에 실패하면 안내 문구를 보여주고 '다시 시도'를 누르면 refetch를 호출한다", async () => {
    const user = userEvent.setup();
    mockProductsQuery({ isError: true });

    render(<RecommendedWishContainer />);

    expect(screen.getByText("추천 상품을 불러오지 못했어요")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("카테고리 칩을 누르면 해당 카테고리로 조회하고, '전체'는 카테고리 없이 조회한다", async () => {
    const user = userEvent.setup();
    mockProductsQuery({ data: mockProducts });

    render(<RecommendedWishContainer />);
    expect(useRecommendedProductsQuery).toHaveBeenLastCalledWith(undefined);

    await user.click(screen.getByRole("button", { name: "향수" }));
    expect(useRecommendedProductsQuery).toHaveBeenLastCalledWith("PERFUME");

    await user.click(screen.getByRole("button", { name: "전체" }));
    expect(useRecommendedProductsQuery).toHaveBeenLastCalledWith(undefined);
  });

  it("'찾는 선물이 없어요'를 누르면 위시 요청 페이지로 이동한다", async () => {
    const user = userEvent.setup();
    mockProductsQuery({ data: mockProducts });

    render(<RecommendedWishContainer />);
    await user.click(screen.getByText("찾는 선물이 없어요"));

    expect(push).toHaveBeenCalledWith("/wish/request");
  });
});
