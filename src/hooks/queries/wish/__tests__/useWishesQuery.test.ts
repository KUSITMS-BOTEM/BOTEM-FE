import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { wishService } from "@/apis/wish/wishService";
import { useWishesQuery } from "@/hooks/queries/wish/useWishesQuery";
import type { WishPageResponse } from "@/types/wish/wish";

vi.mock("@/apis/wish/wishService", () => ({
  wishService: {
    getWishes: vi.fn(),
  },
}));

const mockPage: WishPageResponse = {
  content: [
    {
      id: 1,
      productName: "에어팟 프로",
      productImageUrl: "https://example.com/airpods.png",
      price: 359000,
      productUrl: "https://example.com/product/1",
      sellerName: "쿠팡 Apple 공식 브랜드관",
      status: "AVAILABLE",
      fundingId: null,
    },
  ],
  page: 0,
  size: 10,
  totalElements: 1,
  hasNext: false,
};

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useWishesQuery", () => {
  it("기본 호출 시 wishService.getWishes를 호출하고 반환 데이터를 돌려준다", async () => {
    vi.mocked(wishService.getWishes).mockResolvedValue(mockPage);

    const { result } = renderHook(() => useWishesQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(wishService.getWishes).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockPage);
  });

  it("enabled가 false면 wishService.getWishes를 호출하지 않는다", () => {
    renderHook(() => useWishesQuery({ enabled: false }), { wrapper: createWrapper() });

    expect(wishService.getWishes).not.toHaveBeenCalled();
  });

  it("wishService.getWishes가 실패하면 isError가 true가 된다", async () => {
    vi.mocked(wishService.getWishes).mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useWishesQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
