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
  sellerName: "쿠팡 Apple 공식 브랜드관",
  status: "AVAILABLE",
  fundingId: null,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    // useWishQuery가 오류 코드별 retry 함수를 자체 지정해 QueryClient의 retry:false를 덮어쓰므로,
    // 재시도 지연(retryDelay)만 0으로 둬 일반 오류의 재시도 대기 때문에 테스트가 타임아웃되지 않게 한다
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
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
