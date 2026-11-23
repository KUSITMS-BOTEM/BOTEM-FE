import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { fundingService } from "@/apis/funding/fundingService";
import {
  fundingResultQueryKey,
  useFundingResultQuery,
} from "@/hooks/queries/funding/useFundingResultQuery";
import type { FundingResultResponse } from "@/types/funding/fundingResult";

vi.mock("@/apis/funding/fundingService", () => ({
  fundingService: {
    getResult: vi.fn(),
  },
}));

const mockResult: FundingResultResponse = {
  fundingId: 12,
  productName: "소니 WH-1000XM5",
  productImageUrl: "https://image.example.com/product.jpg",
  targetAmount: 364000,
  confirmedAmount: 215000,
  achievementPercentage: 59,
  targetReached: false,
  participantCount: 1,
  messageCount: 1,
  pendingContributionCount: 0,
  pendingCleanupRequired: false,
  resultOpenedAt: null,
  contributions: [],
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

describe("useFundingResultQuery", () => {
  it("서비스를 펀딩 id로 호출하고 반환 데이터를 돌려준다", async () => {
    vi.mocked(fundingService.getResult).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useFundingResultQuery(12), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fundingService.getResult).toHaveBeenCalledWith(12);
    expect(result.current.data).toEqual(mockResult);
  });

  it("서비스가 실패하면 isError가 true가 된다", async () => {
    vi.mocked(fundingService.getResult).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useFundingResultQuery(12), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("펀딩 id가 바뀌면 새 id로 다시 조회한다", async () => {
    vi.mocked(fundingService.getResult).mockResolvedValue(mockResult);

    const { result, rerender } = renderHook(({ id }) => useFundingResultQuery(id), {
      wrapper: createWrapper(),
      initialProps: { id: 12 },
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ id: 13 });

    await waitFor(() => expect(fundingService.getResult).toHaveBeenCalledWith(13));
  });
});

describe("useFundingResultQuery quiet", () => {
  it("quiet이면 실패해도 재시도하지 않고 FUNDING_005만 전역 에러 안내를 건너뛰도록 표시한다", async () => {
    vi.mocked(fundingService.getResult).mockRejectedValue(new Error("FUNDING_005"));
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: 3, retryDelay: 0 } },
    });
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useFundingResultQuery(12, true, true), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fundingService.getResult).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryCache().find({ queryKey: fundingResultQueryKey(12) })?.meta).toEqual(
      { quietCodes: ["FUNDING_005"] },
    );
  });
});

describe("fundingResultQueryKey", () => {
  it("펀딩 id별로 서로 다른 키를 만든다", () => {
    expect(fundingResultQueryKey(12)).toEqual(["fundings", 12, "result"]);
    expect(fundingResultQueryKey(13)).not.toEqual(fundingResultQueryKey(12));
  });
});
