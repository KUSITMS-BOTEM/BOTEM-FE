import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { contributionService } from "@/apis/contribution/contributionService";
import { useMarkTransferSentMutation } from "@/hooks/mutations/contribution/useMarkTransferSentMutation";
import { myContributionsQueryKey } from "@/hooks/queries/contribution/useMyContributionsQuery";
import { fundingDetailQueryKey } from "@/hooks/queries/funding/useFundingDetailQuery";

vi.mock("@/apis/contribution/contributionService", () => ({
  contributionService: { markTransferSent: vi.fn() },
}));

const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(QueryClientProvider, { client: queryClient }, children);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(contributionService.markTransferSent).mockResolvedValue({
    contributionId: 9,
    status: "PENDING_CONFIRMATION",
  } as never);
});

describe("useMarkTransferSentMutation", () => {
  it("회원은 비밀번호 없이(null) 호출하고 내 보탬·펀딩 상세 캐시를 무효화한다", async () => {
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useMarkTransferSentMutation("share-key-5"), { wrapper });

    result.current.mutate({ contributionId: 9 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(contributionService.markTransferSent).toHaveBeenCalledWith("share-key-5", 9, {
      guestPassword: null,
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: myContributionsQueryKey("share-key-5") });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: fundingDetailQueryKey("share-key-5"),
      exact: true,
    });
  });

  it("비회원은 비밀번호를 함께 보낸다", async () => {
    const { result } = renderHook(() => useMarkTransferSentMutation("share-key-5"), { wrapper });

    result.current.mutate({ contributionId: 9, guestPassword: "1234" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(contributionService.markTransferSent).toHaveBeenCalledWith("share-key-5", 9, {
      guestPassword: "1234",
    });
  });
});
