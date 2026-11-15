import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { fundingService } from "@/apis/funding/fundingService";
import {
  fundingRevealQueryKey,
  useFundingRevealQuery,
} from "@/hooks/queries/funding/useFundingRevealQuery";
import type { FundingRevealResponse } from "@/types/funding/funding";

vi.mock("@/apis/funding/fundingService", () => ({
  fundingService: {
    getReveal: vi.fn(),
  },
}));

const mockReveal: FundingRevealResponse = {
  contributorNames: ["하린이"],
  totalAmount: 215000,
  goalAchieved: false,
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

describe("useFundingRevealQuery", () => {
  it("서비스를 펀딩 id로 호출하고 반환 데이터를 돌려준다", async () => {
    vi.mocked(fundingService.getReveal).mockResolvedValue(mockReveal);

    const { result } = renderHook(() => useFundingRevealQuery(12), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fundingService.getReveal).toHaveBeenCalledWith(12);
    expect(result.current.data).toEqual(mockReveal);
  });

  it("서비스가 실패하면 isError가 true가 된다", async () => {
    vi.mocked(fundingService.getReveal).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useFundingRevealQuery(12), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("펀딩 id가 바뀌면 새 id로 다시 조회한다", async () => {
    vi.mocked(fundingService.getReveal).mockResolvedValue(mockReveal);

    const { result, rerender } = renderHook(({ id }) => useFundingRevealQuery(id), {
      wrapper: createWrapper(),
      initialProps: { id: 12 },
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ id: 13 });

    await waitFor(() => expect(fundingService.getReveal).toHaveBeenCalledWith(13));
  });
});

describe("fundingRevealQueryKey", () => {
  it("펀딩 id별로 서로 다른 키를 만든다", () => {
    expect(fundingRevealQueryKey(12)).toEqual(["fundings", 12, "reveal"]);
    expect(fundingRevealQueryKey(13)).not.toEqual(fundingRevealQueryKey(12));
  });
});
