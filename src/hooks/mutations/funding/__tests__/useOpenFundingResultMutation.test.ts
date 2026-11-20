import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { fundingService } from "@/apis/funding/fundingService";
import { useOpenFundingResultMutation } from "@/hooks/mutations/funding/useOpenFundingResultMutation";
import { fundingResultQueryKey } from "@/hooks/queries/funding/useFundingResultQuery";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";
import type { FundingResultResponse } from "@/types/funding/fundingResult";

vi.mock("@/apis/funding/fundingService", () => ({
  fundingService: { openResult: vi.fn() },
}));

const opened: FundingResultResponse = {
  fundingId: 12,
  productName: "소니 WH-1000XM5",
  productImageUrl: "https://image.example.com/product.jpg",
  targetAmount: 364000,
  confirmedAmount: 429000,
  achievementPercentage: 117,
  targetReached: true,
  participantCount: 8,
  messageCount: 7,
  pendingContributionCount: 0,
  pendingCleanupRequired: false,
  resultOpenedAt: "2026-11-15T00:00:00",
  contributions: [],
};

let queryClient: QueryClient;

const createWrapper = () =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

describe("useOpenFundingResultMutation", () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    vi.mocked(fundingService.openResult).mockReset();
  });

  it("mutate 호출 시 openResult을 펀딩 id로 호출한다", async () => {
    vi.mocked(fundingService.openResult).mockResolvedValue(opened);
    const { result } = renderHook(() => useOpenFundingResultMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(12);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(vi.mocked(fundingService.openResult).mock.calls[0]?.[0]).toBe(12);
  });

  it("성공하면 응답을 결과 조회 캐시에 바로 쓰고 홈 캐시를 무효화한다", async () => {
    vi.mocked(fundingService.openResult).mockResolvedValue(opened);
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useOpenFundingResultMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(12);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(fundingResultQueryKey(12))).toEqual(opened);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: homeQueryKey });
  });

  it("공개 전에 시작된 결과 조회가 늦게 끝나도 공개 응답을 덮어쓰지 않는다", async () => {
    vi.mocked(fundingService.openResult).mockResolvedValue(opened);
    let resolveStale: (value: FundingResultResponse) => void = () => {};
    const staleFetch = queryClient
      .fetchQuery({
        queryKey: fundingResultQueryKey(12),
        queryFn: () =>
          new Promise<FundingResultResponse>(resolve => {
            resolveStale = resolve;
          }),
      })
      .catch(() => undefined);
    const { result } = renderHook(() => useOpenFundingResultMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(12);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    resolveStale({ ...opened, resultOpenedAt: null });
    await staleFetch;

    expect(queryClient.getQueryData(fundingResultQueryKey(12))).toEqual(opened);
  });

  it("실패하면 결과 조회 캐시를 건드리지 않는다", async () => {
    vi.mocked(fundingService.openResult).mockRejectedValue(new Error("FUNDING_007"));
    const { result } = renderHook(() => useOpenFundingResultMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(12);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(fundingResultQueryKey(12))).toBeUndefined();
  });
});
