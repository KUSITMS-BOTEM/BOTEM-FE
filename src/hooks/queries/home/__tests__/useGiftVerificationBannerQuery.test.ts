import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import { useGiftVerificationBannerQuery } from "@/hooks/queries/home/useGiftVerificationBannerQuery";

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe("useGiftVerificationBannerQuery", () => {
  it("배너 API 응답의 visible·pendingCount를 돌려준다", async () => {
    server.use(
      http.get("*/api/home/gift-verifications/banner", () =>
        HttpResponse.json({
          success: true,
          data: { visible: true, pendingCount: 3 },
          error: null,
        }),
      ),
    );

    const { result } = renderHook(() => useGiftVerificationBannerQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ visible: true, pendingCount: 3 });
  });
});
