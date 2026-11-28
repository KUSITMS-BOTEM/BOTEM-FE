import { createElement, type ReactNode } from "react";

import { focusManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { fundingService } from "@/apis/funding/fundingService";
import {
  fundingDetailQueryKey,
  fundingDetailQueryOptions,
  useFundingDetailQuery,
} from "@/hooks/queries/funding/useFundingDetailQuery";
import type { FundingDetailResponse } from "@/types/funding/fundingDetail";

vi.mock("@/apis/funding/fundingService", () => ({
  fundingService: {
    getFundingDetail: vi.fn(),
    getFundingDetailAsMember: vi.fn(),
  },
}));

const mockDetail = { fundingId: 12 } as FundingDetailResponse;

const createWrapper = () => {
  const queryClient = new QueryClient();

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useFundingDetailQuery", () => {
  it("비회원은 토큰 없는 조회를 호출하고 데이터를 돌려준다", async () => {
    vi.mocked(fundingService.getFundingDetail).mockResolvedValue(mockDetail);

    const { result } = renderHook(() => useFundingDetailQuery("share-key-12", false), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fundingService.getFundingDetail).toHaveBeenCalledWith("share-key-12");
    expect(fundingService.getFundingDetailAsMember).not.toHaveBeenCalled();
    expect(result.current.data).toEqual(mockDetail);
  });

  it("회원은 토큰을 붙이는 조회를 호출한다", async () => {
    vi.mocked(fundingService.getFundingDetailAsMember).mockResolvedValue(mockDetail);

    const { result } = renderHook(() => useFundingDetailQuery("share-key-12", true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fundingService.getFundingDetailAsMember).toHaveBeenCalledWith("share-key-12");
    expect(fundingService.getFundingDetail).not.toHaveBeenCalled();
  });

  it("조회가 실패하면 재시도 없이 바로 isError가 된다", async () => {
    vi.mocked(fundingService.getFundingDetail).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useFundingDetailQuery("share-key-12", false), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fundingService.getFundingDetail).toHaveBeenCalledTimes(1);
  });
});

describe("useFundingDetailQuery 폴링", () => {
  const POLL_INTERVAL = 20_000;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    focusManager.setFocused(true);
  });

  afterEach(() => {
    focusManager.setFocused(undefined);
    vi.useRealTimers();
  });

  const renderPolling = async (detail: Partial<FundingDetailResponse>, poll?: boolean) => {
    vi.mocked(fundingService.getFundingDetail).mockResolvedValue({
      ...mockDetail,
      ...detail,
    } as FundingDetailResponse);

    const { result } = renderHook(() => useFundingDetailQuery("share-key-12", false, { poll }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  };

  it("poll이 켜져 있고 진행 중이면 20초 뒤 다시 요청한다", async () => {
    await renderPolling({ displayStatus: "IN_PROGRESS", pendingPercentage: 0 }, true);

    await vi.advanceTimersByTimeAsync(POLL_INTERVAL);

    expect(fundingService.getFundingDetail).toHaveBeenCalledTimes(2);
  });

  it("poll이 켜져 있어도 마감됐고 확인 대기가 0%면 다시 요청하지 않는다", async () => {
    await renderPolling({ displayStatus: "CLOSED", pendingPercentage: 0 }, true);

    await vi.advanceTimersByTimeAsync(POLL_INTERVAL);

    expect(fundingService.getFundingDetail).toHaveBeenCalledTimes(1);
  });

  it("마감됐어도 확인 대기 %가 남아 있으면 계속 다시 요청한다", async () => {
    await renderPolling({ displayStatus: "CLOSED", pendingPercentage: 10 }, true);

    await vi.advanceTimersByTimeAsync(POLL_INTERVAL);

    expect(fundingService.getFundingDetail).toHaveBeenCalledTimes(2);
  });

  it("poll이 없으면 진행 중이어도 다시 요청하지 않는다", async () => {
    await renderPolling({ displayStatus: "IN_PROGRESS", pendingPercentage: 0 });

    await vi.advanceTimersByTimeAsync(POLL_INTERVAL);

    expect(fundingService.getFundingDetail).toHaveBeenCalledTimes(1);
  });
});

describe("fundingDetailQueryOptions", () => {
  it("회원은 마운트 때 다시 받고(staleTime 0) 비회원은 서버 값을 60초 믿는다", () => {
    expect(fundingDetailQueryOptions("share-key-12", true).staleTime).toBe(0);
    expect(fundingDetailQueryOptions("share-key-12", false).staleTime).toBe(60_000);
  });
});

describe("fundingDetailQueryKey", () => {
  it("펀딩 id별 키를 만든다", () => {
    expect(fundingDetailQueryKey("share-key-12")).toEqual(["fundings", "share", "share-key-12"]);
    expect(fundingDetailQueryKey("share-key-13")).not.toEqual(
      fundingDetailQueryKey("share-key-12"),
    );
  });
});
