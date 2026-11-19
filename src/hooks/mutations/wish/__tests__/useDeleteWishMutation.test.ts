import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { wishService } from "@/apis/wish/wishService";
import { useDeleteWishMutation } from "@/hooks/mutations/wish/useDeleteWishMutation";
import { recommendedProductsQueryKey } from "@/hooks/queries/recommended-product/useRecommendedProductsQuery";
import { homeWishesQueryKey } from "@/hooks/queries/wish/useHomeWishesQuery";
import { wishesQueryKey } from "@/hooks/queries/wish/useWishesQuery";
import { useWishDeletedToastStore } from "@/store/wishDeletedToastStore";
import { useWishOriginStore } from "@/store/wishOriginStore";

vi.mock("@/apis/wish/wishService", () => ({
  wishService: {
    deleteWish: vi.fn(),
  },
}));

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe("useDeleteWishMutation", () => {
  beforeEach(() => {
    replace.mockClear();
    useWishOriginStore.setState({ recommendedProductIdByWishId: {} });
    useWishDeletedToastStore.setState({ pending: false });
  });

  it("mutate 호출 시 wishService.deleteWish가 전달받은 wishId로 호출된다", async () => {
    vi.mocked(wishService.deleteWish).mockResolvedValue(null);
    const { result } = renderHook(() => useDeleteWishMutation("1"), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(wishService.deleteWish).toHaveBeenCalledWith("1");
  });

  it("성공 시 router.replace가 /home으로 호출된다", async () => {
    vi.mocked(wishService.deleteWish).mockResolvedValue(null);
    const { result } = renderHook(() => useDeleteWishMutation("1"), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(replace).toHaveBeenCalledWith("/home");
  });

  it("성공 시 추천 상품·위시 목록 쿼리를 무효화한다", async () => {
    vi.mocked(wishService.deleteWish).mockResolvedValue(null);
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useDeleteWishMutation("1"), {
      wrapper: ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const keys = invalidate.mock.calls.map(([filters]) => filters?.queryKey);
    expect(keys).toContainEqual(recommendedProductsQueryKey);
    expect(keys).toContainEqual(wishesQueryKey);
    expect(keys).toContainEqual(homeWishesQueryKey);
  });

  it("추천 상품 상세에서 담은 위시면 그 상세로 이동하고 삭제 토스트를 예약한다", async () => {
    vi.mocked(wishService.deleteWish).mockResolvedValue(null);
    useWishOriginStore.getState().setOrigin("1", 10);
    const { result } = renderHook(() => useDeleteWishMutation("1"), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(replace).toHaveBeenCalledWith("/wish/recommended/10");
    expect(useWishDeletedToastStore.getState().pending).toBe(true);
  });

  it("위시 응답에 추천 상품 id가 있으면 담은 기록이 없어도 그 상세로 이동한다", async () => {
    vi.mocked(wishService.deleteWish).mockResolvedValue(null);
    const { result } = renderHook(() => useDeleteWishMutation("1", 7), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(replace).toHaveBeenCalledWith("/wish/recommended/7");
  });

  it("wishService.deleteWish가 실패하면 isError가 true가 되고 router.replace는 호출되지 않는다", async () => {
    const error = new Error("위시 삭제 실패");
    vi.mocked(wishService.deleteWish).mockRejectedValue(error);
    const { result } = renderHook(() => useDeleteWishMutation("1"), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
    expect(replace).not.toHaveBeenCalled();
  });
});
