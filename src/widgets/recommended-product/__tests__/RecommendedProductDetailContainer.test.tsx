import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useAddWishMutation } from "@/hooks/mutations/wish/useAddWishMutation";
import { useRecommendedProductQuery } from "@/hooks/queries/recommended-product/useRecommendedProductQuery";
import { ApiError } from "@/types/api";
import type { RecommendedProductResponse } from "@/types/recommended-product/recommendedProduct";
import RecommendedProductDetailContainer from "@/widgets/recommended-product/RecommendedProductDetailContainer";

vi.mock("@/hooks/queries/recommended-product/useRecommendedProductQuery", () => ({
  useRecommendedProductQuery: vi.fn(),
}));
vi.mock("@/hooks/mutations/wish/useAddWishMutation", () => ({ useAddWishMutation: vi.fn() }));

const replace = vi.fn();
const back = vi.fn();
const notFound = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, back }),
  useParams: () => ({ productId: "3" }),
  notFound: () => notFound(),
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

const refetch = vi.fn();
const addWish = vi.fn();

const mockProductQuery = (value: Partial<ReturnType<typeof useRecommendedProductQuery>>) => {
  vi.mocked(useRecommendedProductQuery).mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    refetch,
    ...value,
  } as ReturnType<typeof useRecommendedProductQuery>);
};

const mockAddWishMutation = (value: { isPending?: boolean; isSuccess?: boolean } = {}) => {
  vi.mocked(useAddWishMutation).mockReturnValue({
    mutate: addWish,
    isPending: false,
    isSuccess: false,
    ...value,
  } as unknown as ReturnType<typeof useAddWishMutation>);
};

describe("RecommendedProductDetailContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAddWishMutation();
  });

  it("상품이 로드되면 상품명·가격과 '위시에 담기' 버튼을 보여준다", () => {
    mockProductQuery({ data: mockProduct });

    render(<RecommendedProductDetailContainer />);

    expect(screen.getByText("에어팟 프로 3")).toBeInTheDocument();
    expect(screen.getByText("359,000원")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "위시에 담기" })).toBeInTheDocument();
  });

  it("'위시에 담기'를 누르면 해당 상품 id로 addWish를 호출한다", async () => {
    const user = userEvent.setup();
    mockProductQuery({ data: mockProduct });

    render(<RecommendedProductDetailContainer />);
    await user.click(screen.getByRole("button", { name: "위시에 담기" }));

    expect(addWish).toHaveBeenCalledWith({ recommendedProductId: 3 }, expect.any(Object));
  });

  it("담기 요청이 처리 중이거나 성공한 뒤에는 버튼이 비활성화된다", () => {
    mockProductQuery({ data: mockProduct });
    mockAddWishMutation({ isSuccess: true });

    render(<RecommendedProductDetailContainer />);

    expect(screen.getByRole("button", { name: "위시에 담기" })).toBeDisabled();
  });

  it("isPending이 반영되기 전에 빠르게 연타해도 addWish는 한 번만 호출된다", async () => {
    const user = userEvent.setup();
    mockProductQuery({ data: mockProduct });

    render(<RecommendedProductDetailContainer />);
    const button = screen.getByRole("button", { name: "위시에 담기" });
    await user.dblClick(button);

    expect(addWish).toHaveBeenCalledTimes(1);
  });

  it("담기가 실패하면 잠금이 풀려 다시 시도할 수 있다", async () => {
    const user = userEvent.setup();
    addWish.mockImplementation((_body, options) => options.onError());
    mockProductQuery({ data: mockProduct });

    render(<RecommendedProductDetailContainer />);
    const button = screen.getByRole("button", { name: "위시에 담기" });
    await user.click(button);
    await user.click(button);

    expect(addWish).toHaveBeenCalledTimes(2);
  });

  it("로딩 중이면 스켈레톤만 보이고 CTA 버튼은 렌더하지 않는다", () => {
    mockProductQuery({ isLoading: true });

    render(<RecommendedProductDetailContainer />);

    expect(screen.queryByRole("button", { name: "위시에 담기" })).not.toBeInTheDocument();
  });

  it("상품이 없으면 안내 문구를 보여주고 '다시 시도'를 누르면 refetch를 호출한다", async () => {
    const user = userEvent.setup();
    mockProductQuery({ data: undefined });

    render(<RecommendedProductDetailContainer />);

    expect(screen.getByText("상품 정보를 불러오지 못했어요")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("판매 종료 상품이면 재시도 버튼 없이 안내 문구만 보여준다", () => {
    mockProductQuery({ data: { ...mockProduct, status: "DISCONTINUED" } });

    render(<RecommendedProductDetailContainer />);

    expect(screen.getByText("지금은 고를 수 없는 선물이에요")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "위시에 담기" })).not.toBeInTheDocument();
  });

  it("PRODUCT_001 에러면 notFound를 호출한다", () => {
    mockProductQuery({ error: new ApiError("PRODUCT_001", "상품 없음") as never });

    render(<RecommendedProductDetailContainer />);

    expect(notFound).toHaveBeenCalled();
  });

  it("인증 에러(AUTH_*)면 랜딩('/')으로 replace한다", () => {
    mockProductQuery({ error: new ApiError("AUTH_001", "인증 실패") as never });

    render(<RecommendedProductDetailContainer />);

    expect(replace).toHaveBeenCalledWith("/");
  });

  it("그 외 API 에러면 에러 메시지로 alert를 띄운다", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    mockProductQuery({ error: new ApiError("PRODUCT_002", "상품 조회 실패") as never });

    render(<RecommendedProductDetailContainer />);

    expect(alertSpy).toHaveBeenCalledWith("상품 조회 실패");
    alertSpy.mockRestore();
  });
});
