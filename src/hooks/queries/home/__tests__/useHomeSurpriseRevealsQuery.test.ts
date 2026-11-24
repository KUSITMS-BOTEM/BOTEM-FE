import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { homeService } from "@/apis/home/homeService";
import {
  homeSurpriseRevealsQueryKey,
  useHomeSurpriseRevealsQuery,
} from "@/hooks/queries/home/useHomeSurpriseRevealsQuery";
import type { SurpriseRevealCardListResponse } from "@/types/home/home";

vi.mock("@/apis/home/homeService", () => ({
  homeService: { getSurpriseReveals: vi.fn() },
}));

const reveals: SurpriseRevealCardListResponse = {
  cards: [
    {
      fundingId: 96,
      productImageUrl: "https://image.example.com/p.jpg",
      productName: "에어팟 프로 2",
      organizerName: "하린",
      participantCount: 5,
      revealAt: "2026-11-20T00:00:00",
    },
  ],
};

let queryClient: QueryClient;

const createWrapper = () =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

beforeEach(() => {
  vi.clearAllMocks();
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});

describe("useHomeSurpriseRevealsQuery", () => {
  it("공개 카드 목록을 조회해 돌려준다", async () => {
    vi.mocked(homeService.getSurpriseReveals).mockResolvedValue(reveals);

    const { result } = renderHook(() => useHomeSurpriseRevealsQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(reveals);
  });

  it("실패해도 전역 에러 토스트를 띄우지 않도록 skipGlobalError를 단다", async () => {
    vi.mocked(homeService.getSurpriseReveals).mockRejectedValue(new Error("실패"));

    const { result } = renderHook(() => useHomeSurpriseRevealsQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    const query = queryClient.getQueryCache().find({ queryKey: homeSurpriseRevealsQueryKey });
    expect(query?.meta).toEqual({ skipGlobalError: true });
  });

  it("쿼리 키는 홈 접두사 아래에 있어 홈 무효화에 함께 묶인다", () => {
    expect(homeSurpriseRevealsQueryKey).toEqual(["home", "surprise-reveals"]);
  });
});
