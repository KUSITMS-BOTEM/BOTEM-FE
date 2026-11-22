import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { fundingService } from "@/apis/funding/fundingService";
import {
  rollingPaperQueryKey,
  useRollingPaperQuery,
} from "@/hooks/queries/funding/useRollingPaperQuery";
import type { RollingPaperResponse } from "@/types/funding/rollingPaper";

vi.mock("@/apis/funding/fundingService", () => ({
  fundingService: {
    getRollingPaper: vi.fn(),
  },
}));

const mockRollingPaper: RollingPaperResponse = {
  fundingId: 12,
  celebrantName: "지유",
  messageCount: 0,
  messages: [],
};

const createWrapper = () => {
  const queryClient = new QueryClient();

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useRollingPaperQuery", () => {
  it("서비스를 펀딩 id로 호출하고 반환 데이터를 돌려준다", async () => {
    vi.mocked(fundingService.getRollingPaper).mockResolvedValue(mockRollingPaper);

    const { result } = renderHook(() => useRollingPaperQuery(12), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fundingService.getRollingPaper).toHaveBeenCalledWith(12);
    expect(result.current.data).toEqual(mockRollingPaper);
  });

  it("enabled가 false면 조회하지 않는다", () => {
    renderHook(() => useRollingPaperQuery(12, false), { wrapper: createWrapper() });

    expect(fundingService.getRollingPaper).not.toHaveBeenCalled();
  });

  it("실패해도 다시 호출하지 않고 isError가 true가 된다", async () => {
    vi.mocked(fundingService.getRollingPaper).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useRollingPaperQuery(12), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fundingService.getRollingPaper).toHaveBeenCalledTimes(1);
  });
});

describe("rollingPaperQueryKey", () => {
  it("Swagger 경로 순서대로 펀딩 id별 키를 만든다", () => {
    expect(rollingPaperQueryKey(12)).toEqual(["fundings", 12, "rolling-paper"]);
  });
});
