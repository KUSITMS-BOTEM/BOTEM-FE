import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { productRequestService } from "@/apis/productRequest/productRequestService";
import { useRequestProductMutation } from "@/hooks/mutations/productRequest/useRequestProductMutation";

vi.mock("@/apis/productRequest/productRequestService", () => ({
  productRequestService: {
    requestProduct: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

const body = { productUrl: "https://www.coupang.com/vp/products/1", productName: "에어팟" };

describe("useRequestProductMutation", () => {
  it("mutate 호출 시 productRequestService.requestProduct가 전달받은 body로 호출된다", async () => {
    vi.mocked(productRequestService.requestProduct).mockResolvedValue(null);
    const { result } = renderHook(() => useRequestProductMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(vi.mocked(productRequestService.requestProduct).mock.calls[0][0]).toEqual(body);
  });

  it("productRequestService.requestProduct가 실패하면 isError가 true가 된다", async () => {
    const error = new Error("상품 추가 요청 실패");
    vi.mocked(productRequestService.requestProduct).mockRejectedValue(error);
    const { result } = renderHook(() => useRequestProductMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
