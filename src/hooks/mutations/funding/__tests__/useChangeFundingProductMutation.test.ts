import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { fundingService } from "@/apis/funding/fundingService";
import { useChangeFundingProductMutation } from "@/hooks/mutations/funding/useChangeFundingProductMutation";
import { fundingManagementQueryKey } from "@/hooks/queries/funding/useFundingManagementQuery";
import { surpriseRevealQueryKey } from "@/hooks/queries/funding/useSurpriseRevealQuery";
import { fundingResultQueryKey } from "@/hooks/queries/funding/useFundingResultQuery";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";
import { wishesQueryKey } from "@/hooks/queries/wish/useWishesQuery";

vi.mock("@/apis/funding/fundingService", () => ({
  fundingService: { changeFundingProduct: vi.fn() },
}));

const response = {
  fundingId: 7,
  product: {
    name: "에어팟",
    imageUrl: "https://example.com/1.png",
    price: 359000,
    url: "https://example.com",
  },
  productChangedAt: "2026-11-20T10:00:00",
};

let queryClient: QueryClient;
const createWrapper = () =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  vi.mocked(fundingService.changeFundingProduct).mockReset();
});

describe("useChangeFundingProductMutation", () => {
  it("펀딩 id와 고른 위시 id로 상품 변경을 요청한다", async () => {
    vi.mocked(fundingService.changeFundingProduct).mockResolvedValue(response);
    const { result } = renderHook(() => useChangeFundingProductMutation(7), {
      wrapper: createWrapper(),
    });

    result.current.mutate(3);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fundingService.changeFundingProduct).toHaveBeenCalledWith(7, { wishId: 3 });
  });

  it("성공하면 펀딩 결과·관리 상세·서프라이즈 공개 상세·위시·홈 캐시를 무효화한다", async () => {
    vi.mocked(fundingService.changeFundingProduct).mockResolvedValue(response);
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useChangeFundingProductMutation(7), {
      wrapper: createWrapper(),
    });

    result.current.mutate(3);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: fundingResultQueryKey(7) });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: fundingManagementQueryKey(7) });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: wishesQueryKey });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: homeQueryKey });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: surpriseRevealQueryKey(7) });
  });

  it("실패하면 캐시를 무효화하지 않는다", async () => {
    vi.mocked(fundingService.changeFundingProduct).mockRejectedValue(new Error("FUNDING_043"));
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useChangeFundingProductMutation(7), {
      wrapper: createWrapper(),
    });

    result.current.mutate(3);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).not.toHaveBeenCalled();
  });
});
