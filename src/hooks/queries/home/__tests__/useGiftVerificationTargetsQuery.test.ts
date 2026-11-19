import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import { useGiftVerificationTargetsQuery } from "@/hooks/queries/home/useGiftVerificationTargetsQuery";
import type { GiftVerificationTargetListResponse } from "@/types/home/home";

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const targetList: GiftVerificationTargetListResponse = {
  pendingCount: 1,
  targets: [
    {
      giftVerificationId: 101,
      fundingId: 12,
      productName: "에어팟",
      productImageUrl: "/airpods.png",
      fundingDeadline: "2026-10-13T23:59:59",
      participantCount: 6,
      replacementProductName: null,
    },
  ],
};

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe("useGiftVerificationTargetsQuery", () => {
  it("인증 대상 목록 API 응답을 돌려준다", async () => {
    server.use(
      http.get("*/api/home/gift-verifications", () =>
        HttpResponse.json({ success: true, data: targetList, error: null }),
      ),
    );

    const { result } = renderHook(() => useGiftVerificationTargetsQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(targetList);
  });

  it("enabled가 false면 요청을 보내지 않는다", async () => {
    const requested = vi.fn();
    server.use(
      http.get("*/api/home/gift-verifications", () => {
        requested();
        return HttpResponse.json({ success: true, data: targetList, error: null });
      }),
    );

    const { result } = renderHook(() => useGiftVerificationTargetsQuery({ enabled: false }), {
      wrapper: createWrapper(),
    });

    // 요청이 나간다면 fetch가 시작되므로 잠시 기다린 뒤에도 idle·미호출인지 확인한다
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(result.current.fetchStatus).toBe("idle");
    expect(requested).not.toHaveBeenCalled();
  });
});
