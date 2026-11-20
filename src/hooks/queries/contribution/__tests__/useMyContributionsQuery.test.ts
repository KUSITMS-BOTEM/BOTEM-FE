import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { contributionService } from "@/apis/contribution/contributionService";
import {
  myContributionsQueryKey,
  useMyContributionsQuery,
} from "@/hooks/queries/contribution/useMyContributionsQuery";
import type { MyContributionListResponse } from "@/types/contribution/contribution";

vi.mock("@/apis/contribution/contributionService", () => ({
  contributionService: {
    getMyContributions: vi.fn(),
  },
}));

const noContributions: MyContributionListResponse = { editable: true, contributions: [] };

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useMyContributionsQuery", () => {
  it("보탬이 없으면 에러가 아니라 빈 배열을 그대로 돌려준다", async () => {
    vi.mocked(contributionService.getMyContributions).mockResolvedValue(noContributions);

    const { result } = renderHook(() => useMyContributionsQuery(12, true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(contributionService.getMyContributions).toHaveBeenCalledWith(12);
    expect(result.current.data?.contributions).toEqual([]);
  });

  it("enabled가 false면 요청하지 않는다 (비로그인 401 방지)", () => {
    renderHook(() => useMyContributionsQuery(12, false), { wrapper: createWrapper() });

    expect(contributionService.getMyContributions).not.toHaveBeenCalled();
  });

  it("서비스가 실패하면 재시도 없이 isError가 true가 된다", async () => {
    vi.mocked(contributionService.getMyContributions).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useMyContributionsQuery(12, true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(contributionService.getMyContributions).toHaveBeenCalledTimes(1);
  });

  it("쿼리 키는 Swagger 경로 순서를 따른다", () => {
    expect(myContributionsQueryKey(12)).toEqual(["fundings", 12, "contributions", "me"]);
  });
});
