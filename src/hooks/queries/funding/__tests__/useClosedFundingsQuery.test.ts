import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { fundingService } from "@/apis/funding/fundingService";
import {
  closedFundingsQueryKey,
  useClosedFundingsQuery,
} from "@/hooks/queries/funding/useClosedFundingsQuery";
import type { ClosedFundingListResponse } from "@/types/funding/closedFunding";

vi.mock("@/apis/funding/fundingService", () => ({
  fundingService: { getClosedFundings: vi.fn() },
}));

const list: ClosedFundingListResponse = {
  tabCounts: { all: 0, received: 0, participated: 0 },
  years: [],
};

let queryClient: QueryClient;

const createWrapper = () =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

describe("useClosedFundingsQuery", () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.mocked(fundingService.getClosedFundings).mockReset();
  });

  it("마감된 펀딩 목록을 조회해 반환한다", async () => {
    vi.mocked(fundingService.getClosedFundings).mockResolvedValue(list);
    const { result } = renderHook(() => useClosedFundingsQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(list);
    expect(queryClient.getQueryData(closedFundingsQueryKey)).toEqual(list);
  });

  it("enabled가 false면 서비스를 호출하지 않는다", () => {
    const { result } = renderHook(() => useClosedFundingsQuery(false), {
      wrapper: createWrapper(),
    });

    expect(fundingService.getClosedFundings).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("조회가 실패하면 isError가 되고 전역 에러 안내를 건너뛰도록 표시한다", async () => {
    vi.mocked(fundingService.getClosedFundings).mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useClosedFundingsQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryCache().find({ queryKey: closedFundingsQueryKey })?.meta).toEqual({
      skipGlobalError: true,
    });
  });
});
