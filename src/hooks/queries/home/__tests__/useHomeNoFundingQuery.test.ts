import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { homeService } from "@/apis/home/homeService";
import { useHomeNoFundingQuery } from "@/hooks/queries/home/useHomeNoFundingQuery";
import type { HomeNoFundingResponse } from "@/types/home/home";

vi.mock("@/apis/home/homeService", () => ({
  homeService: {
    getNoFunding: vi.fn(),
  },
}));

const mockNoFunding: HomeNoFundingResponse = {
  state: "EMPTY",
  nickname: "지유",
  birthdayDday: null,
  wishes: { content: [], page: 0, size: 10, totalElements: 0, hasNext: false },
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

describe("useHomeNoFundingQuery", () => {
  it("enabled가 false면 homeService.getNoFunding을 호출하지 않는다", () => {
    renderHook(() => useHomeNoFundingQuery({ enabled: false }), { wrapper: createWrapper() });

    expect(homeService.getNoFunding).not.toHaveBeenCalled();
  });

  it("enabled가 true면 homeService.getNoFunding을 호출하고 반환 데이터를 돌려준다", async () => {
    vi.mocked(homeService.getNoFunding).mockResolvedValue(mockNoFunding);

    const { result } = renderHook(() => useHomeNoFundingQuery({ enabled: true }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(homeService.getNoFunding).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockNoFunding);
  });

  it("homeService.getNoFunding이 실패하면 isError가 true가 된다", async () => {
    vi.mocked(homeService.getNoFunding).mockRejectedValue(new Error("conflict"));

    const { result } = renderHook(() => useHomeNoFundingQuery({ enabled: true }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
