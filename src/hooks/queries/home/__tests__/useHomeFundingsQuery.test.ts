import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { homeService } from "@/apis/home/homeService";
import { useHomeFundingsQuery } from "@/hooks/queries/home/useHomeFundingsQuery";
import type { HomeFundingListResponse } from "@/types/home/home";

vi.mock("@/apis/home/homeService", () => ({
  homeService: {
    getFundings: vi.fn(),
  },
}));

const mockFundingList: HomeFundingListResponse = {
  fundingCards: [],
  activeFundingCount: 0,
  canOpenFunding: true,
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

describe("useHomeFundingsQuery", () => {
  it("homeService.getFundings를 호출하고 반환 데이터를 돌려준다", async () => {
    vi.mocked(homeService.getFundings).mockResolvedValue(mockFundingList);

    const { result } = renderHook(() => useHomeFundingsQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(homeService.getFundings).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockFundingList);
  });

  it("homeService.getFundings가 실패하면 isError가 true가 된다", async () => {
    vi.mocked(homeService.getFundings).mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useHomeFundingsQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
