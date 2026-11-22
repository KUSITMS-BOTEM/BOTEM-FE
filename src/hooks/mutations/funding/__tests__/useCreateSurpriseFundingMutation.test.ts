import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { fundingService } from "@/apis/funding/fundingService";
import { useCreateSurpriseFundingMutation } from "@/hooks/mutations/funding/useCreateSurpriseFundingMutation";
import { friendsQueryKey } from "@/hooks/queries/friend/useFriendsQuery";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";
import type { CreateSurpriseFundingRequest } from "@/types/funding/funding";

vi.mock("@/apis/funding/fundingService", () => ({
  fundingService: { postSurpriseFunding: vi.fn() },
}));

const body: CreateSurpriseFundingRequest = {
  recipientId: 3,
  wishId: 9,
  bank: "TOSS_BANK",
  accountNumber: "100159014821",
  targetAmount: 350000,
  deadline: "2026-11-30",
  revealAt: "2026-12-01",
  showOnRecipientProfile: true,
};
const created = {
  fundingId: 8,
  type: "SURPRISE",
  status: "FUNDING",
  shareKey: "share-key-8",
  shareUrl: "https://x/8",
} as const;

let queryClient: QueryClient;

const createWrapper = () =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

describe("useCreateSurpriseFundingMutation", () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    vi.mocked(fundingService.postSurpriseFunding).mockReset();
  });

  it("전달받은 body로 호출하고 개설된 펀딩을 돌려준다", async () => {
    vi.mocked(fundingService.postSurpriseFunding).mockResolvedValue(created);
    const { result } = renderHook(() => useCreateSurpriseFundingMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(vi.mocked(fundingService.postSurpriseFunding).mock.calls[0][0]).toEqual(body);
    expect(result.current.data).toEqual(created);
  });

  it("성공하면 친구와 홈 캐시를 무효화한다", async () => {
    vi.mocked(fundingService.postSurpriseFunding).mockResolvedValue(created);
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCreateSurpriseFundingMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: friendsQueryKey });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: homeQueryKey });
  });

  it("응답이 비어 있으면 실패로 다루고 캐시를 무효화하지 않는다", async () => {
    vi.mocked(fundingService.postSurpriseFunding).mockResolvedValue(null);
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCreateSurpriseFundingMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("요청이 실패하면 캐시를 무효화하지 않는다", async () => {
    vi.mocked(fundingService.postSurpriseFunding).mockRejectedValue(new Error("fail"));
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCreateSurpriseFundingMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).not.toHaveBeenCalled();
  });
});
