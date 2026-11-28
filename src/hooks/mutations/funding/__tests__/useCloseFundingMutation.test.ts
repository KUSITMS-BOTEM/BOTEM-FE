import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { fundingService } from "@/apis/funding/fundingService";
import { useCloseFundingMutation } from "@/hooks/mutations/funding/useCloseFundingMutation";
import { closedFundingsQueryKey } from "@/hooks/queries/funding/useClosedFundingsQuery";
import { fundingManagementQueryKey } from "@/hooks/queries/funding/useFundingManagementQuery";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";

vi.mock("@/apis/funding/fundingService", () => ({
  fundingService: { closeFunding: vi.fn() },
}));

const closeResponse = {
  fundingId: 7,
  type: "BIRTHDAY" as const,
  status: "CLOSED",
  deadline: "2026-12-31",
  revealAt: null,
  earlyClosedAt: "2026-11-20T10:00:00",
};

let queryClient: QueryClient;

const createWrapper = () =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

describe("useCloseFundingMutation", () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    vi.mocked(fundingService.closeFunding).mockReset();
  });

  it("mutate하면 closeFunding이 전달한 fundingId로 호출된다", async () => {
    vi.mocked(fundingService.closeFunding).mockResolvedValue(closeResponse);
    const { result } = renderHook(() => useCloseFundingMutation(), { wrapper: createWrapper() });

    result.current.mutate(7);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(vi.mocked(fundingService.closeFunding).mock.calls[0][0]).toBe(7);
  });

  it("성공하면 그 펀딩의 관리(상세) 캐시와 홈 캐시를 무효화한다", async () => {
    vi.mocked(fundingService.closeFunding).mockResolvedValue(closeResponse);
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCloseFundingMutation(), { wrapper: createWrapper() });

    result.current.mutate(7);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: fundingManagementQueryKey(7) });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: homeQueryKey });
  });

  it("참여자 0명 종료(CANCELLED)면 관리(상세)는 다시 조회하지 않고 홈·보관함 캐시를 무효화한다", async () => {
    vi.mocked(fundingService.closeFunding).mockResolvedValue({
      ...closeResponse,
      status: "CANCELLED",
      earlyClosedAt: null,
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCloseFundingMutation(), { wrapper: createWrapper() });

    result.current.mutate(7);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: homeQueryKey });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: closedFundingsQueryKey });
    expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: fundingManagementQueryKey(7) });
  });

  it("실패하면 캐시를 무효화하지 않고 에러 상태가 된다", async () => {
    vi.mocked(fundingService.closeFunding).mockRejectedValue(new Error("fail"));
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCloseFundingMutation(), { wrapper: createWrapper() });

    result.current.mutate(7);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
