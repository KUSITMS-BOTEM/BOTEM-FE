import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { friendService } from "@/apis/friend/friendService";
import { useFriendWishQuery } from "@/hooks/queries/friend/useFriendWishQuery";
import type { FriendWishDetailResponse } from "@/types/friend/friend";

vi.mock("@/apis/friend/friendService", () => ({
  friendService: {
    getFriendWish: vi.fn(),
  },
}));

const mockWish: FriendWishDetailResponse = {
  wishId: 11,
  productName: "모자",
  productImageUrl: "https://example.com/hat.png",
  price: 429000,
  productUrl: "https://link.coupang.com/a/example",
  sellerName: "쿠팡",
  activeSurpriseFundingId: null,
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

describe("useFriendWishQuery", () => {
  it("friendId·wishId로 friendService.getFriendWish를 호출하고 응답을 돌려준다", async () => {
    vi.mocked(friendService.getFriendWish).mockResolvedValue(mockWish);

    const { result } = renderHook(() => useFriendWishQuery("5", "11"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(friendService.getFriendWish).toHaveBeenCalledWith("5", "11");
    expect(result.current.data).toEqual(mockWish);
  });

  it("요청이 실패하면 data 없이 에러 상태가 된다", async () => {
    vi.mocked(friendService.getFriendWish).mockRejectedValue(new Error("404"));

    const { result } = renderHook(() => useFriendWishQuery("5", "999"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
