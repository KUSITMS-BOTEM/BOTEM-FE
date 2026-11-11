import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";

import { wishService } from "@/apis/wish/wishService";
import { useHomeWishesQuery } from "@/hooks/queries/wish/useHomeWishesQuery";
import type { WishPageResponse } from "@/types/wish/wish";

vi.mock("@/apis/wish/wishService", () => ({
  wishService: { getWishesPage: vi.fn() },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

const page = (number: number, hasNext: boolean): WishPageResponse => ({
  content: [],
  page: number,
  size: 4,
  totalElements: 5,
  hasNext,
});

it("홈 위시를 첫 페이지부터 조회하고 hasNext가 있으면 다음 페이지를 요청한다", async () => {
  vi.mocked(wishService.getWishesPage)
    .mockResolvedValueOnce(page(0, true))
    .mockResolvedValueOnce(page(1, false));

  const { result } = renderHook(() => useHomeWishesQuery(), { wrapper: createWrapper() });

  await waitFor(() => expect(result.current.hasNextPage).toBe(true));
  await act(async () => result.current.fetchNextPage());

  expect(wishService.getWishesPage).toHaveBeenNthCalledWith(1, 0, 4);
  expect(wishService.getWishesPage).toHaveBeenNthCalledWith(2, 1, 4);
  await waitFor(() => expect(result.current.data?.pages).toEqual([page(0, true), page(1, false)]));
  expect(result.current.hasNextPage).toBe(false);
});
