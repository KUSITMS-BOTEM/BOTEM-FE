import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { fundingService } from "@/apis/funding/fundingService";
import {
  fundingManagementQueryKey,
  useFundingManagementQuery,
} from "@/hooks/queries/funding/useFundingManagementQuery";
import type { FundingManagementResponse } from "@/types/funding/fundingManagement";

vi.mock("@/apis/funding/fundingService", () => ({
  fundingService: { getFundingManagement: vi.fn() },
}));

const mockManagement = {
  fundingId: 12,
  product: { name: "소니 WH-1000XM5", imageUrl: "", price: 459000, url: "https://x" },
  deadline: "2026-11-30T23:59:59.999999",
  actions: {
    canCloseEarly: false,
    canExtend: true,
    canChangeProduct: false,
    canReissueShareCard: false,
  },
} as FundingManagementResponse;

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

beforeEach(() => vi.clearAllMocks());

describe("useFundingManagementQuery", () => {
  it("서비스를 펀딩 id로 호출하고 반환 데이터를 돌려준다", async () => {
    vi.mocked(fundingService.getFundingManagement).mockResolvedValue(mockManagement);

    const { result } = renderHook(() => useFundingManagementQuery(12), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fundingService.getFundingManagement).toHaveBeenCalledWith(12);
    expect(result.current.data).toEqual(mockManagement);
  });

  it("서비스가 실패하면 isError가 true가 된다", async () => {
    vi.mocked(fundingService.getFundingManagement).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useFundingManagementQuery(12), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("fundingManagementQueryKey", () => {
  it("Swagger 경로 순서대로 펀딩 id별 키를 만든다", () => {
    expect(fundingManagementQueryKey(12)).toEqual(["fundings", 12, "management"]);
    expect(fundingManagementQueryKey(13)).not.toEqual(fundingManagementQueryKey(12));
  });
});
