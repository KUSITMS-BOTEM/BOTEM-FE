import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { contributionService } from "@/apis/contribution/contributionService";
import {
  pendingContributionItemsQueryKey,
  usePendingContributionItemsQuery,
} from "@/hooks/queries/contribution/usePendingContributionItemsQuery";
import { pendingContributionsQueryKey } from "@/hooks/queries/contribution/usePendingContributionsQuery";
import type { PendingContributionItemListResponse } from "@/types/contribution/contribution";

vi.mock("@/apis/contribution/contributionService", () => ({
  contributionService: {
    getPendingContributionItems: vi.fn(),
  },
}));

const mockList: PendingContributionItemListResponse = {
  pendingContributionCount: 1,
  contributions: [
    {
      contributionId: 31,
      participantName: "하린",
      profileImageUrl: null,
      participatedAt: "2026-11-20T14:03:12",
      amount: 45000,
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

describe("usePendingContributionItemsQuery", () => {
  it("펀딩 id로 서비스를 호출하고 반환 데이터를 돌려준다", async () => {
    vi.mocked(contributionService.getPendingContributionItems).mockResolvedValue(mockList);

    const { result } = renderHook(() => usePendingContributionItemsQuery(12, true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(contributionService.getPendingContributionItems).toHaveBeenCalledWith(12);
    expect(result.current.data).toEqual(mockList);
  });

  it("enabled가 false면 요청하지 않는다", () => {
    renderHook(() => usePendingContributionItemsQuery(12, false), { wrapper: createWrapper() });

    expect(contributionService.getPendingContributionItems).not.toHaveBeenCalled();
  });

  it("서비스가 실패하면 isError가 true가 된다", async () => {
    vi.mocked(contributionService.getPendingContributionItems).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => usePendingContributionItemsQuery(12, true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("홈 시트 키의 하위 키라 같은 키로 무효화하면 함께 갱신된다", () => {
    expect(pendingContributionItemsQueryKey(12).slice(0, 4)).toEqual(
      pendingContributionsQueryKey(12),
    );
  });
});
