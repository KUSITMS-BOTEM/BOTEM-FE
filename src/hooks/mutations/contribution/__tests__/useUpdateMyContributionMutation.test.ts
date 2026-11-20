import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { contributionService } from "@/apis/contribution/contributionService";
import { useUpdateMyContributionMutation } from "@/hooks/mutations/contribution/useUpdateMyContributionMutation";
import { myContributionsQueryKey } from "@/hooks/queries/contribution/useMyContributionsQuery";
import { fundingDetailQueryKey } from "@/hooks/queries/funding/useFundingDetailQuery";
import type { MyContributionListResponse } from "@/types/contribution/contribution";

vi.mock("@/apis/contribution/contributionService", () => ({
  contributionService: { updateMyContribution: vi.fn() },
}));

let queryClient: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(QueryClientProvider, { client: queryClient }, children);

const body = { message: "수정", paperTemplateCode: "ORANGE_VIVID_SOLID" } as never;

beforeEach(() => {
  vi.clearAllMocks();
  queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
});

describe("useUpdateMyContributionMutation", () => {
  it("응답의 보탬으로 목록 캐시의 같은 보탬만 교체하고 상세를 다시 조회한다", async () => {
    queryClient.setQueryData(myContributionsQueryKey("share-key-5"), {
      editable: true,
      contributions: [
        { contributionId: 1, message: "기존1" },
        { contributionId: 2, message: "기존2" },
      ],
    } as unknown as MyContributionListResponse);
    vi.mocked(contributionService.updateMyContribution).mockResolvedValue({
      contributionId: 2,
      message: "수정됨",
    } as never);
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useUpdateMyContributionMutation("share-key-5"), {
      wrapper,
    });

    result.current.mutate({ contributionId: 2, body });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(contributionService.updateMyContribution).toHaveBeenCalledWith("share-key-5", 2, body);
    expect(
      queryClient.getQueryData<MyContributionListResponse>(myContributionsQueryKey("share-key-5"))
        ?.contributions,
    ).toEqual([
      { contributionId: 1, message: "기존1" },
      { contributionId: 2, message: "수정됨" },
    ]);
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: fundingDetailQueryKey("share-key-5"),
      exact: true,
    });
  });

  it("목록 캐시가 없으면 새로 만들지 않는다", async () => {
    vi.mocked(contributionService.updateMyContribution).mockResolvedValue({
      contributionId: 2,
    } as never);
    const { result } = renderHook(() => useUpdateMyContributionMutation("share-key-5"), {
      wrapper,
    });

    result.current.mutate({ contributionId: 2, body });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(myContributionsQueryKey("share-key-5"))).toBeUndefined();
  });
});
