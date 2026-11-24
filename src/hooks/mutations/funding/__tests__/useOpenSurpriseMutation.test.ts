import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { fundingService } from "@/apis/funding/fundingService";
import { useOpenSurpriseMutation } from "@/hooks/mutations/funding/useOpenSurpriseMutation";
import { surpriseRevealQueryKey } from "@/hooks/queries/funding/useSurpriseRevealQuery";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";
import type { SurpriseRevealResponse } from "@/types/funding/surprise";

vi.mock("@/apis/funding/fundingService", () => ({
  fundingService: { openSurprise: vi.fn() },
}));

const opened = { fundingId: 96, openedAt: "2026-11-21T09:00:00" } as SurpriseRevealResponse;

let queryClient: QueryClient;

const createWrapper = () =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

beforeEach(() => {
  vi.clearAllMocks();
  queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
});

describe("useOpenSurpriseMutation", () => {
  it("성공하면 응답을 공개 상세 캐시에 쓰고 홈 캐시를 무효화한다", async () => {
    vi.mocked(fundingService.openSurprise).mockResolvedValue(opened);
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useOpenSurpriseMutation(), { wrapper: createWrapper() });

    result.current.mutate(96);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(vi.mocked(fundingService.openSurprise).mock.calls[0]?.[0]).toBe(96);
    expect(queryClient.getQueryData(surpriseRevealQueryKey(96))).toEqual(opened);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: homeQueryKey });
  });

  it("공개 상세 캐시에 쓰기 전에 진행 중인 공개 상세 조회를 취소한다", async () => {
    vi.mocked(fundingService.openSurprise).mockResolvedValue(opened);
    const cancel = vi.spyOn(queryClient, "cancelQueries");
    const { result } = renderHook(() => useOpenSurpriseMutation(), { wrapper: createWrapper() });

    result.current.mutate(96);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(cancel).toHaveBeenCalledWith({ queryKey: surpriseRevealQueryKey(96), exact: true });
  });

  it("실패하면 isError가 되고 홈 캐시를 무효화하지 않는다", async () => {
    vi.mocked(fundingService.openSurprise).mockRejectedValue(new Error("실패"));
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useOpenSurpriseMutation(), { wrapper: createWrapper() });

    result.current.mutate(96);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).not.toHaveBeenCalled();
  });
});
