import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { recommendedProductService } from "@/apis/recommendedProduct/recommendedProductService";
import { useRecommendedProductsQuery } from "@/hooks/queries/recommendedProduct/useRecommendedProductsQuery";
import type { RecommendedProductResponse } from "@/types/recommendedProduct/recommendedProduct";

vi.mock("@/apis/recommendedProduct/recommendedProductService", () => ({
  recommendedProductService: {
    getRecommendedProducts: vi.fn(),
  },
}));

const mockRecommendedProducts: RecommendedProductResponse[] = [
  {
    id: 1,
    name: "에어팟 프로",
    imageUrl: "https://example.com/airpods.png",
    price: 359000,
    sellerName: "애플",
    category: "EARPHONE_HEADPHONE",
    status: "ON_SALE",
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe("useRecommendedProductsQuery", () => {
  it("category 없이 훅을 호출하면 recommendedProductService.getRecommendedProducts가 undefined로 호출된다", async () => {
    vi.mocked(recommendedProductService.getRecommendedProducts).mockResolvedValue(
      mockRecommendedProducts,
    );
    const { result } = renderHook(() => useRecommendedProductsQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(recommendedProductService.getRecommendedProducts).toHaveBeenCalledWith(undefined);
  });

  it("category를 지정해 훅을 호출하면 recommendedProductService.getRecommendedProducts가 해당 category로 호출된다", async () => {
    vi.mocked(recommendedProductService.getRecommendedProducts).mockResolvedValue(
      mockRecommendedProducts,
    );
    const { result } = renderHook(() => useRecommendedProductsQuery("EARPHONE_HEADPHONE"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(recommendedProductService.getRecommendedProducts).toHaveBeenCalledWith(
      "EARPHONE_HEADPHONE",
    );
  });

  it("조회 성공 시 data에 응답이 그대로 반영된다", async () => {
    vi.mocked(recommendedProductService.getRecommendedProducts).mockResolvedValue(
      mockRecommendedProducts,
    );
    const { result } = renderHook(() => useRecommendedProductsQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockRecommendedProducts);
  });

  it("recommendedProductService.getRecommendedProducts가 실패하면 isError가 true가 되고 error가 반영된다", async () => {
    const error = new Error("추천 상품 조회 실패");
    vi.mocked(recommendedProductService.getRecommendedProducts).mockRejectedValue(error);
    const { result } = renderHook(() => useRecommendedProductsQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(error);
  });
});
