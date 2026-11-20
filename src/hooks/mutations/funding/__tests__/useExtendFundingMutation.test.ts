import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { fundingService } from "@/apis/funding/fundingService";
import { useExtendFundingMutation } from "@/hooks/mutations/funding/useExtendFundingMutation";
import { fundingManagementQueryKey } from "@/hooks/queries/funding/useFundingManagementQuery";
import { fundingResultQueryKey } from "@/hooks/queries/funding/useFundingResultQuery";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";

vi.mock("@/apis/funding/fundingService", () => ({
  fundingService: { extendFunding: vi.fn() },
}));

const response = {
  fundingId: 7,
  status: "FUNDING",
  deadline: "2026-11-30T23:59:59.999999",
  extensionCount: 1,
  extendedAt: "2026-11-20T10:00:00",
};

let queryClient: QueryClient;
const createWrapper = () =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  vi.mocked(fundingService.extendFunding).mockReset();
});

describe("useExtendFundingMutation", () => {
  it("새 마감일로 연장을 요청한다", async () => {
    vi.mocked(fundingService.extendFunding).mockResolvedValue(response);
    const { result } = renderHook(() => useExtendFundingMutation(7), { wrapper: createWrapper() });

    result.current.mutate("2026-11-30");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fundingService.extendFunding).toHaveBeenCalledWith(7, { newDeadline: "2026-11-30" });
  });

  it("성공하면 관리 상세·홈은 무효화하고, 새 마감일 전엔 조회가 막히는 결과는 무효화하지 않는다", async () => {
    vi.mocked(fundingService.extendFunding).mockResolvedValue(response);
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useExtendFundingMutation(7), { wrapper: createWrapper() });

    result.current.mutate("2026-11-30");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: fundingManagementQueryKey(7) });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: homeQueryKey });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: fundingResultQueryKey(7) });
  });
});
