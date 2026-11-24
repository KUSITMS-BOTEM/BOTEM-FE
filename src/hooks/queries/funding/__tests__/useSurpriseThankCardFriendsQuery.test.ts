import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { fundingService } from "@/apis/funding/fundingService";
import {
  surpriseThankCardFriendsQueryKey,
  useSurpriseThankCardFriendsQuery,
} from "@/hooks/queries/funding/useSurpriseThankCardFriendsQuery";
import type { SurpriseThankCardFriendsResponse } from "@/types/funding/surprise";

vi.mock("@/apis/funding/fundingService", () => ({
  fundingService: { getSurpriseThankCardFriends: vi.fn() },
}));

const friends: SurpriseThankCardFriendsResponse = {
  fundingId: 96,
  friends: [
    {
      contributionId: 1,
      name: "하린",
      profileImageUrl: null,
      organizer: true,
      messageTypes: ["TEXT"],
      contributedDate: "2026-11-10",
      thankCardSent: false,
    },
  ],
};

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useSurpriseThankCardFriendsQuery", () => {
  it("서비스를 펀딩 id로 호출하고 반환 데이터를 돌려준다", async () => {
    vi.mocked(fundingService.getSurpriseThankCardFriends).mockResolvedValue(friends);

    const { result } = renderHook(() => useSurpriseThankCardFriendsQuery(96), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fundingService.getSurpriseThankCardFriends).toHaveBeenCalledWith(96);
    expect(result.current.data).toEqual(friends);
  });

  it("서비스가 실패하면 isError가 true가 된다", async () => {
    vi.mocked(fundingService.getSurpriseThankCardFriends).mockRejectedValue(new Error("실패"));

    const { result } = renderHook(() => useSurpriseThankCardFriendsQuery(96), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("실패해도 화면이 대신 처리하므로 전역 에러 안내를 건너뛰도록 표시한다", async () => {
    vi.mocked(fundingService.getSurpriseThankCardFriends).mockRejectedValue(new Error("실패"));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useSurpriseThankCardFriendsQuery(96), {
      wrapper: ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(
      queryClient.getQueryCache().find({ queryKey: surpriseThankCardFriendsQueryKey(96) })?.meta,
    ).toEqual({ skipGlobalError: true });
  });

  it("enabled가 false면 조회하지 않는다", () => {
    renderHook(() => useSurpriseThankCardFriendsQuery(96, false), { wrapper: createWrapper() });

    expect(fundingService.getSurpriseThankCardFriends).not.toHaveBeenCalled();
  });

  it("쿼리 키는 Swagger 경로 순서를 따른다", () => {
    expect(surpriseThankCardFriendsQueryKey(96)).toEqual([
      "fundings",
      96,
      "surprise",
      "thank-card-friends",
    ]);
  });
});
