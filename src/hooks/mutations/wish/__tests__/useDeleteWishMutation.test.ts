import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { wishService } from "@/apis/wish/wishService";
import { useDeleteWishMutation } from "@/hooks/mutations/wish/useDeleteWishMutation";

vi.mock("@/apis/wish/wishService", () => ({
  wishService: {
    deleteWish: vi.fn(),
  },
}));

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

const removeQueries = vi.fn();
vi.mock("@/lib/queryClient", () => ({
  queryClient: {
    removeQueries: (...args: unknown[]) => removeQueries(...args),
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

describe("useDeleteWishMutation", () => {
  beforeEach(() => {
    replace.mockClear();
    removeQueries.mockClear();
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

  it("성공 시 router.replace가 /main으로 호출된다", async () => {
    vi.mocked(wishService.deleteWish).mockResolvedValue(null);
    const { result } = renderHook(() => useDeleteWishMutation("1"), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(replace).toHaveBeenCalledWith("/main");
  });

  it("성공 시 해당 wishId의 쿼리 캐시가 제거된다", async () => {
    vi.mocked(wishService.deleteWish).mockResolvedValue(null);
    const { result } = renderHook(() => useDeleteWishMutation("1"), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(removeQueries).toHaveBeenCalledWith({ queryKey: ["wishes", "1"] });
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
