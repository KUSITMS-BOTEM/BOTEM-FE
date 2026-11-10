import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { wishService } from "@/apis/wish/wishService";
import { useWishQuery } from "@/hooks/queries/wish/useWishQuery";
import type { WishResponse } from "@/types/wish/wish";

vi.mock("@/apis/wish/wishService", () => ({
  wishService: {
    getWish: vi.fn(),
  },
}));

const mockWish: WishResponse = {
  id: 1,
  productName: "에어팟 프로",
  productImageUrl: "https://example.com/airpods.png",
  price: 359000,
  productUrl: "https://example.com/product/1",
  status: "AVAILABLE",
  fundingId: null,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe("useWishQuery", () => {
  it("훅 호출 시 wishService.getWish가 전달한 wishId로 호출된다", async () => {
    vi.mocked(wishService.getWish).mockResolvedValue(mockWish);
    const { result } = renderHook(() => useWishQuery("1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(wishService.getWish).toHaveBeenCalledWith("1");
  });

  it("조회 성공 시 data에 위시 정보가 그대로 반영된다", async () => {
    vi.mocked(wishService.getWish).mockResolvedValue(mockWish);
    const { result } = renderHook(() => useWishQuery("1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockWish);
  });

  it("wishService.getWish가 실패하면 isError가 true가 되고 error가 반영된다", async () => {
    const error = new Error("위시 조회 실패");
    vi.mocked(wishService.getWish).mockRejectedValue(error);
    const { result } = renderHook(() => useWishQuery("1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(error);
  });
});
