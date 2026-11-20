import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { fundingService } from "@/apis/funding/fundingService";
import {
  fundingManagementQueryKey,
  useFundingManagementQuery,
} from "@/hooks/queries/funding/useFundingManagementQuery";
import type { FundingManagementResponse } from "@/types/funding/fundingManagement";

vi.mock("@/apis/funding/fundingService", () => ({
  fundingService: {
    getFundingManagement: vi.fn(),
  },
}));

const mockManagement = { fundingId: 12, messageCount: 8 } as FundingManagementResponse;

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useFundingManagementQuery", () => {
  it("펀딩 id로 서비스를 호출하고 반환 데이터를 돌려준다", async () => {
    vi.mocked(fundingService.getFundingManagement).mockResolvedValue(mockManagement);

    const { result } = renderHook(() => useFundingManagementQuery(12, true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fundingService.getFundingManagement).toHaveBeenCalledWith(12);
    expect(result.current.data).toEqual(mockManagement);
  });

  it("enabled가 false면 요청하지 않는다", () => {
    renderHook(() => useFundingManagementQuery(12, false), { wrapper: createWrapper() });

    expect(fundingService.getFundingManagement).not.toHaveBeenCalled();
  });

  it("서비스가 실패하면 isError가 true가 된다", async () => {
    vi.mocked(fundingService.getFundingManagement).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useFundingManagementQuery(12, true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("쿼리 키는 Swagger 경로 순서를 따른다", () => {
    expect(fundingManagementQueryKey(12)).toEqual(["fundings", 12, "management"]);
  });
});
