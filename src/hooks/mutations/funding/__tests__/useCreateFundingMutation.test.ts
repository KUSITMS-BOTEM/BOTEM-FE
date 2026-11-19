import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { fundingService } from "@/apis/funding/fundingService";
import { useCreateFundingMutation } from "@/hooks/mutations/funding/useCreateFundingMutation";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";
import { homeWishesQueryKey } from "@/hooks/queries/wish/useHomeWishesQuery";
import { wishesQueryKey } from "@/hooks/queries/wish/useWishesQuery";
import type { CreateFundingRequest } from "@/types/funding/funding";

vi.mock("@/apis/funding/fundingService", () => ({
  fundingService: { postFunding: vi.fn() },
}));

const body: CreateFundingRequest = {
  wishId: 1,
  bank: "TOSS_BANK",
  accountNumber: "100159014821",
  targetAmount: 350000,
  deadline: "2026-11-30",
  story: "생일 선물",
};

let queryClient: QueryClient;

const createWrapper = () =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

describe("useCreateFundingMutation", () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    vi.mocked(fundingService.postFunding).mockReset();
  });

  it("mutate 호출 시 postFunding이 전달받은 body로 호출된다", async () => {
    vi.mocked(fundingService.postFunding).mockResolvedValue({
      fundingId: 7,
      type: "BIRTHDAY",
      status: "FUNDING",
      shareUrl: "https://example.com/funding/7",
    });
    const { result } = renderHook(() => useCreateFundingMutation(), { wrapper: createWrapper() });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(vi.mocked(fundingService.postFunding).mock.calls[0][0]).toEqual(body);
  });

  it("성공하면 위시 목록·홈 위시·홈 펀딩 캐시를 무효화한다", async () => {
    vi.mocked(fundingService.postFunding).mockResolvedValue({
      fundingId: 7,
      type: "BIRTHDAY",
      status: "FUNDING",
      shareUrl: "https://example.com/funding/7",
    });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCreateFundingMutation(), { wrapper: createWrapper() });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: wishesQueryKey, exact: true });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: homeWishesQueryKey });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: homeQueryKey });
  });

  it("실패하면 캐시를 무효화하지 않는다", async () => {
    vi.mocked(fundingService.postFunding).mockRejectedValue(new Error("fail"));
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCreateFundingMutation(), { wrapper: createWrapper() });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).not.toHaveBeenCalled();
  });
});
