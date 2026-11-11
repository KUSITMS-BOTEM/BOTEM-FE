import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { wishService } from "@/apis/wish/wishService";
import { useAddWishMutation } from "@/hooks/mutations/wish/useAddWishMutation";
import type { WishResponse } from "@/types/wish/wish";

vi.mock("@/apis/wish/wishService", () => ({
  wishService: {
    addWish: vi.fn(),
  },
}));

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

const mockWish: WishResponse = {
  id: 1,
  productName: "에어팟 프로",
  productImageUrl: "https://example.com/airpods.png",
  price: 359000,
  productUrl: "https://example.com/airpods",
  status: "AVAILABLE",
  fundingId: null,
};

const queryClient = new QueryClient({
  defaultOptions: { mutations: { retry: false } },
});

const createWrapper = () =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

describe("useAddWishMutation", () => {
  beforeEach(() => {
    replace.mockClear();
    queryClient.clear();
  });

  it("mutate 호출 시 wishService.addWish가 전달받은 body로 호출된다", async () => {
    vi.mocked(wishService.addWish).mockResolvedValue(mockWish);
    const { result } = renderHook(() => useAddWishMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ recommendedProductId: 1 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(wishService.addWish).toHaveBeenCalledWith({ recommendedProductId: 1 });
  });

  it("성공 시 router.replace가 응답 id의 위시 상세(/wish/{id})로 호출된다", async () => {
    vi.mocked(wishService.addWish).mockResolvedValue({ ...mockWish, id: 7 });
    const { result } = renderHook(() => useAddWishMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ recommendedProductId: 1 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(replace).toHaveBeenCalledWith("/wish/7");
  });

  it("성공 시 위시 상세 쿼리 캐시(['wishes', String(id)])가 응답으로 미리 채워진다", async () => {
    vi.mocked(wishService.addWish).mockResolvedValue({ ...mockWish, id: 7 });
    const { result } = renderHook(() => useAddWishMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ recommendedProductId: 1 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(["wishes", "7"])).toEqual({ ...mockWish, id: 7 });
  });

  it("성공 응답의 data가 null이면 추천 목록(/wish/recommended)으로 되돌아간다", async () => {
    vi.mocked(wishService.addWish).mockResolvedValue(null);
    const { result } = renderHook(() => useAddWishMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ recommendedProductId: 1 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(replace).toHaveBeenCalledWith("/wish/recommended");
  });

  it("wishService.addWish가 실패하면 isError가 true가 되고 router.replace는 호출되지 않는다", async () => {
    const error = new Error("위시 담기 실패");
    vi.mocked(wishService.addWish).mockRejectedValue(error);
    const { result } = renderHook(() => useAddWishMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ recommendedProductId: 1 });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
    expect(replace).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(["wishes", "1"])).toBeUndefined();
  });
});
