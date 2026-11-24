import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { fundingService } from "@/apis/funding/fundingService";
import {
  surpriseGiftPreparationQueryKey,
  useSurpriseGiftPreparationQuery,
} from "@/hooks/queries/funding/useSurpriseGiftPreparationQuery";
import type { SurpriseGiftPreparationResponse } from "@/types/funding/surprise";

vi.mock("@/apis/funding/fundingService", () => ({
  fundingService: { getSurpriseGiftPreparation: vi.fn() },
}));

const preparation = { fundingId: 20, targetReached: true } as SurpriseGiftPreparationResponse;

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useSurpriseGiftPreparationQuery", () => {
  it("서비스를 펀딩 id로 호출하고 반환 데이터를 돌려준다", async () => {
    vi.mocked(fundingService.getSurpriseGiftPreparation).mockResolvedValue(preparation);

    const { result } = renderHook(() => useSurpriseGiftPreparationQuery(20), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fundingService.getSurpriseGiftPreparation).toHaveBeenCalledWith(20);
    expect(result.current.data).toEqual(preparation);
  });

  it("서비스가 실패하면 isError가 true가 된다", async () => {
    vi.mocked(fundingService.getSurpriseGiftPreparation).mockRejectedValue(new Error("실패"));

    const { result } = renderHook(() => useSurpriseGiftPreparationQuery(20), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("쿼리 키는 Swagger 경로 순서를 따른다", () => {
    expect(surpriseGiftPreparationQueryKey(20)).toEqual([
      "fundings",
      20,
      "surprise",
      "gift-preparation",
    ]);
  });
});
