import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { recommendedProductService } from "@/apis/recommendedProduct/recommendedProductService";
import { useRecommendedProductQuery } from "@/hooks/queries/recommendedProduct/useRecommendedProductQuery";
import { ApiError } from "@/types/api";
import type { RecommendedProductResponse } from "@/types/recommendedProduct/recommendedProduct";

vi.mock("@/apis/recommendedProduct/recommendedProductService", () => ({
  recommendedProductService: {
    getRecommendedProduct: vi.fn(),
  },
}));

const mockRecommendedProduct: RecommendedProductResponse = {
  id: 1,
  name: "에어팟 프로",
  imageUrl: "https://example.com/airpods.png",
  price: 359000,
  sellerName: "애플",
  category: "EARPHONE_HEADPHONE",
  status: "ON_SALE",
};

const createWrapper = () => {
  // retryDelay를 0으로 둬서, retry 로직 자체(재시도 여부)는 훅이 그대로 판단하되 테스트는 실제 대기 없이 끝난다
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retryDelay: 0 } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe("useRecommendedProductQuery", () => {
  beforeEach(() => {
    vi.mocked(recommendedProductService.getRecommendedProduct).mockClear();
  });

  it("productId로 훅을 호출하면 recommendedProductService.getRecommendedProduct가 해당 productId로 호출된다", async () => {
    vi.mocked(recommendedProductService.getRecommendedProduct).mockResolvedValue(
      mockRecommendedProduct,
    );
    const { result } = renderHook(() => useRecommendedProductQuery("1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(recommendedProductService.getRecommendedProduct).toHaveBeenCalledWith("1");
  });

  it("조회 성공 시 data에 응답이 그대로 반영된다", async () => {
    vi.mocked(recommendedProductService.getRecommendedProduct).mockResolvedValue(
      mockRecommendedProduct,
    );
    const { result } = renderHook(() => useRecommendedProductQuery("1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockRecommendedProduct);
  });

  it("ApiError code가 PRODUCT_001이면 재시도하지 않고 즉시 isError가 된다", async () => {
    const error = new ApiError("PRODUCT_001", "상품 없음");
    vi.mocked(recommendedProductService.getRecommendedProduct).mockRejectedValue(error);
    const { result } = renderHook(() => useRecommendedProductQuery("1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(recommendedProductService.getRecommendedProduct).toHaveBeenCalledTimes(1);
  });

  it("ApiError code가 AUTH_로 시작하면 재시도하지 않고 즉시 isError가 된다", async () => {
    const error = new ApiError("AUTH_002", "인증 실패");
    vi.mocked(recommendedProductService.getRecommendedProduct).mockRejectedValue(error);
    const { result } = renderHook(() => useRecommendedProductQuery("1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(recommendedProductService.getRecommendedProduct).toHaveBeenCalledTimes(1);
  });

  it("ApiError가 아닌 일반 에러는 최대 3번 재시도된 뒤에 isError가 된다", async () => {
    const error = new Error("네트워크 오류");
    vi.mocked(recommendedProductService.getRecommendedProduct).mockRejectedValue(error);
    const { result } = renderHook(() => useRecommendedProductQuery("1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(recommendedProductService.getRecommendedProduct).toHaveBeenCalledTimes(4);
  });
});
