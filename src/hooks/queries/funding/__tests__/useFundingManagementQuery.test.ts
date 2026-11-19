import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { fundingService } from "@/apis/funding/fundingService";
import { MOCK_FUNDING_MANAGEMENT } from "@/apis/funding/fundingService.msw";
import {
  fundingManagementQueryKey,
  useFundingManagementQuery,
} from "@/hooks/queries/funding/useFundingManagementQuery";

vi.mock("@/apis/funding/fundingService", () => ({
  fundingService: { getFundingManagement: vi.fn() },
}));

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

describe("useFundingManagementQuery", () => {
  beforeEach(() => vi.mocked(fundingService.getFundingManagement).mockReset());

  it("펀딩 id로 조회해 ['fundings', id, 'management'] 키에 담는다", async () => {
    vi.mocked(fundingService.getFundingManagement).mockResolvedValue(MOCK_FUNDING_MANAGEMENT);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useFundingManagementQuery(3), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fundingService.getFundingManagement).toHaveBeenCalledWith(3);
    expect(fundingManagementQueryKey(3)).toEqual(["fundings", 3, "management"]);
    expect(queryClient.getQueryData(fundingManagementQueryKey(3))).toEqual(MOCK_FUNDING_MANAGEMENT);
  });

  it("enabled가 false면 요청하지 않는다", () => {
    const queryClient = new QueryClient();
    renderHook(() => useFundingManagementQuery(3, false), { wrapper: createWrapper(queryClient) });

    expect(fundingService.getFundingManagement).not.toHaveBeenCalled();
  });
});
