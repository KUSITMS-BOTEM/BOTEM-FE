import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { fundingService } from "@/apis/funding/fundingService";
import { useCompleteSurpriseGiftPreparationMutation } from "@/hooks/mutations/funding/useCompleteSurpriseGiftPreparationMutation";
import { surpriseGiftPreparationQueryKey } from "@/hooks/queries/funding/useSurpriseGiftPreparationQuery";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";
import type { SurpriseGiftPreparationResponse } from "@/types/funding/surprise";

vi.mock("@/apis/funding/fundingService", () => ({
  fundingService: { completeSurpriseGiftPreparation: vi.fn() },
}));

const prepared = {
  fundingId: 20,
  giftPreparedAt: "2026-11-21T10:00:00",
} as SurpriseGiftPreparationResponse;

let queryClient: QueryClient;

const createWrapper = () =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

beforeEach(() => {
  vi.clearAllMocks();
  queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
});

describe("useCompleteSurpriseGiftPreparationMutation", () => {
  it("펀딩 id로 선물 준비 완료를 요청한다", async () => {
    vi.mocked(fundingService.completeSurpriseGiftPreparation).mockResolvedValue(prepared);
    const { result } = renderHook(() => useCompleteSurpriseGiftPreparationMutation(20), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(vi.mocked(fundingService.completeSurpriseGiftPreparation).mock.calls[0]?.[0]).toBe(20);
  });

  it("성공하면 응답을 선물 준비 조회 캐시에 쓰고 홈 캐시를 무효화한다", async () => {
    vi.mocked(fundingService.completeSurpriseGiftPreparation).mockResolvedValue(prepared);
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCompleteSurpriseGiftPreparationMutation(20), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(surpriseGiftPreparationQueryKey(20))).toEqual(prepared);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: homeQueryKey });
  });

  it("응답 data가 비어 있으면 캐시를 덮어쓰지 않는다", async () => {
    vi.mocked(fundingService.completeSurpriseGiftPreparation).mockResolvedValue(null);
    queryClient.setQueryData(surpriseGiftPreparationQueryKey(20), prepared);
    const { result } = renderHook(() => useCompleteSurpriseGiftPreparationMutation(20), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(surpriseGiftPreparationQueryKey(20))).toEqual(prepared);
  });

  it("실패하면 isError가 되고 홈 캐시를 무효화하지 않는다", async () => {
    vi.mocked(fundingService.completeSurpriseGiftPreparation).mockRejectedValue(
      new Error("FUNDING_007"),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCompleteSurpriseGiftPreparationMutation(20), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).not.toHaveBeenCalled();
  });
});
