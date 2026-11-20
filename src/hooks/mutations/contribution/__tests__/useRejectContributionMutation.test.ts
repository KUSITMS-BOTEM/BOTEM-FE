import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { contributionService } from "@/apis/contribution/contributionService";
import { useRejectContributionMutation } from "@/hooks/mutations/contribution/useRejectContributionMutation";
import { pendingContributionsQueryKey } from "@/hooks/queries/contribution/usePendingContributionsQuery";
import { fundingManagementQueryKey } from "@/hooks/queries/funding/useFundingManagementQuery";
import { homeFundingsQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";

vi.mock("@/apis/contribution/contributionService", () => ({
  contributionService: {
    rejectContribution: vi.fn(),
  },
}));

const setup = () => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  return { wrapper, invalidateQueries };
};

const response = {
  contributionId: 31,
  status: "REJECTED" as const,
  progress: {
    confirmedPercentage: 55,
    pendingPercentage: 15,
    pendingContributionCount: 1,
    targetReached: false,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useRejectContributionMutation", () => {
  it("mutate 호출 시 펀딩 id와 참여 id로 reject 서비스를 호출한다", async () => {
    vi.mocked(contributionService.rejectContribution).mockResolvedValue(response);
    const { wrapper } = setup();
    const { result } = renderHook(() => useRejectContributionMutation(), { wrapper });

    result.current.mutate({ fundingId: 5, contributionId: 31 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(contributionService.rejectContribution).toHaveBeenCalledWith(5, 31);
    expect(result.current.data).toEqual(response);
  });

  it("성공하면 해당 펀딩의 pending 목록·관리 상세와 홈 펀딩 목록 쿼리를 무효화한다", async () => {
    vi.mocked(contributionService.rejectContribution).mockResolvedValue(response);
    const { wrapper, invalidateQueries } = setup();
    const { result } = renderHook(() => useRejectContributionMutation(), { wrapper });

    result.current.mutate({ fundingId: 5, contributionId: 31 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: pendingContributionsQueryKey(5) });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: homeFundingsQueryKey });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: fundingManagementQueryKey(5) });
  });

  it("pending 목록 재조회가 끝날 때까지 isPending을 유지한다", async () => {
    vi.mocked(contributionService.rejectContribution).mockResolvedValue(response);
    const { wrapper, invalidateQueries } = setup();
    let finishRefetch!: () => void;
    invalidateQueries.mockImplementation(
      () => new Promise<void>(resolve => (finishRefetch = resolve)),
    );
    const { result } = renderHook(() => useRejectContributionMutation(), { wrapper });

    result.current.mutate({ fundingId: 5, contributionId: 31 });

    await waitFor(() =>
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: pendingContributionsQueryKey(5) }),
    );
    expect(result.current.isPending).toBe(true);

    finishRefetch();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("서비스가 실패하면 isError가 true가 되고 쿼리를 무효화하지 않는다", async () => {
    const error = new Error("입금 확인 처리 실패");
    vi.mocked(contributionService.rejectContribution).mockRejectedValue(error);
    const { wrapper, invalidateQueries } = setup();
    const { result } = renderHook(() => useRejectContributionMutation(), { wrapper });

    result.current.mutate({ fundingId: 5, contributionId: 31 });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
