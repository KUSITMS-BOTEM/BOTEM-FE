import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { contributionService } from "@/apis/contribution/contributionService";
import {
  pendingContributionsQueryKey,
  usePendingContributionsQuery,
} from "@/hooks/queries/contribution/usePendingContributionsQuery";
import type { PendingContributionListResponse } from "@/types/contribution/contribution";

vi.mock("@/apis/contribution/contributionService", () => ({
  contributionService: {
    getPendingContributions: vi.fn(),
  },
}));

const mockList: PendingContributionListResponse = {
  contributions: [{ contributionId: 1, senderName: "하린이", depositMethod: "토스뱅크 계좌" }],
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

describe("usePendingContributionsQuery", () => {
  it("fundingId가 있고 enabled면 서비스를 호출하고 반환 데이터를 돌려준다", async () => {
    vi.mocked(contributionService.getPendingContributions).mockResolvedValue(mockList);

    const { result } = renderHook(
      () => usePendingContributionsQuery({ fundingId: 3, enabled: true }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(contributionService.getPendingContributions).toHaveBeenCalledWith(3);
    expect(result.current.data).toEqual(mockList);
  });

  it("fundingId가 null이면 enabled여도 서비스를 호출하지 않는다", () => {
    renderHook(() => usePendingContributionsQuery({ fundingId: null, enabled: true }), {
      wrapper: createWrapper(),
    });

    expect(contributionService.getPendingContributions).not.toHaveBeenCalled();
  });

  it("enabled가 false면 fundingId가 있어도 서비스를 호출하지 않는다", () => {
    renderHook(() => usePendingContributionsQuery({ fundingId: 3, enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(contributionService.getPendingContributions).not.toHaveBeenCalled();
  });

  it("서비스가 실패하면 isError가 true가 된다", async () => {
    vi.mocked(contributionService.getPendingContributions).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(
      () => usePendingContributionsQuery({ fundingId: 3, enabled: true }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("pendingContributionsQueryKey", () => {
  it("펀딩 id별로 서로 다른 키를 만든다", () => {
    expect(pendingContributionsQueryKey(3)).toEqual(["fundings", 3, "contributions", "pending"]);
    expect(pendingContributionsQueryKey(4)).not.toEqual(pendingContributionsQueryKey(3));
  });
});
