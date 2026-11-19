import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { fundingService } from "@/apis/funding/fundingService";
import {
  ownerFundingDetailQueryKey,
  useOwnerFundingDetailQuery,
} from "@/hooks/queries/funding/useOwnerFundingDetailQuery";
import type { OwnerFundingDetailResponse } from "@/types/funding/ownerFundingDetail";

vi.mock("@/apis/funding/fundingService", () => ({
  fundingService: {
    getOwnerFundingDetail: vi.fn(),
  },
}));

const mockDetail = { fundingId: 12, confirmedPercentage: 45 } as OwnerFundingDetailResponse;

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useOwnerFundingDetailQuery", () => {
  it("키는 Swagger 경로 순서대로 ['fundings', id, 'management']다", () => {
    expect(ownerFundingDetailQueryKey(12)).toEqual(["fundings", 12, "management"]);
  });

  it("enabled면 서비스를 펀딩 id로 호출하고 데이터를 돌려준다", async () => {
    vi.mocked(fundingService.getOwnerFundingDetail).mockResolvedValue(mockDetail);
    const { result } = renderHook(
      () => useOwnerFundingDetailQuery({ fundingId: 12, enabled: true }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fundingService.getOwnerFundingDetail).toHaveBeenCalledWith(12);
    expect(result.current.data).toEqual(mockDetail);
  });

  it("enabled가 false면 요청하지 않는다", () => {
    renderHook(() => useOwnerFundingDetailQuery({ fundingId: 12, enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(fundingService.getOwnerFundingDetail).not.toHaveBeenCalled();
  });

  it("서비스가 실패하면 isError가 true가 된다", async () => {
    vi.mocked(fundingService.getOwnerFundingDetail).mockRejectedValue(new Error("fail"));
    const { result } = renderHook(
      () => useOwnerFundingDetailQuery({ fundingId: 12, enabled: true }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
