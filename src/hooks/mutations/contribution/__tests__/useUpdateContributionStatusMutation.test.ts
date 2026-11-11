import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { contributionService } from "@/apis/contribution/contributionService";
import { useUpdateContributionStatusMutation } from "@/hooks/mutations/contribution/useUpdateContributionStatusMutation";
import { pendingContributionsQueryKey } from "@/hooks/queries/contribution/usePendingContributionsQuery";

vi.mock("@/apis/contribution/contributionService", () => ({
  contributionService: {
    updateContributionStatus: vi.fn(),
  },
}));

const setup = () => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  return { wrapper, invalidateQueries };
};

const body = { contributionIds: [1, 2], status: "CONFIRMED" as const };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useUpdateContributionStatusMutation", () => {
  it("mutate 호출 시 펀딩 id와 body로 서비스를 호출한다", async () => {
    vi.mocked(contributionService.updateContributionStatus).mockResolvedValue(null);
    const { wrapper } = setup();
    const { result } = renderHook(() => useUpdateContributionStatusMutation(5), { wrapper });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(contributionService.updateContributionStatus).toHaveBeenCalledWith(5, body);
  });

  it("성공하면 해당 펀딩의 pending 목록 쿼리를 무효화한다", async () => {
    vi.mocked(contributionService.updateContributionStatus).mockResolvedValue(null);
    const { wrapper, invalidateQueries } = setup();
    const { result } = renderHook(() => useUpdateContributionStatusMutation(5), { wrapper });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: pendingContributionsQueryKey(5) });
  });

  it("성공하면 홈 펀딩 목록 쿼리도 무효화한다", async () => {
    vi.mocked(contributionService.updateContributionStatus).mockResolvedValue(null);
    const { wrapper, invalidateQueries } = setup();
    const { result } = renderHook(() => useUpdateContributionStatusMutation(5), { wrapper });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["home", "fundings"] });
  });

  it("서비스가 실패하면 isError가 true가 되고 쿼리를 무효화하지 않는다", async () => {
    const error = new Error("상태 변경 실패");
    vi.mocked(contributionService.updateContributionStatus).mockRejectedValue(error);
    const { wrapper, invalidateQueries } = setup();
    const { result } = renderHook(() => useUpdateContributionStatusMutation(5), { wrapper });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
