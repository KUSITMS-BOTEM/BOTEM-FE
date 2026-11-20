import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { wishService } from "@/apis/wish/wishService";
import { useAddWishMutation } from "@/hooks/mutations/wish/useAddWishMutation";
import { useGiftChangeStore } from "@/store/giftChangeStore";
import { useWishOriginStore } from "@/store/wishOriginStore";
import { useWishToastStore } from "@/store/wishToastStore";
import type { WishResponse } from "@/types/wish/wish";

vi.mock("@/apis/wish/wishService", () => ({
  wishService: {
    addWish: vi.fn(),
  },
}));

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

const mockWish: WishResponse = {
  id: 1,
  productName: "에어팟 프로",
  productImageUrl: "https://example.com/airpods.png",
  price: 359000,
  productUrl: "https://example.com/airpods",
  sellerName: "쿠팡 Apple 공식 브랜드관",
  status: "AVAILABLE",
  fundingId: null,
};

const queryClient = new QueryClient({
  defaultOptions: { mutations: { retry: false } },
});

const createWrapper = () =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

describe("useAddWishMutation", () => {
  beforeEach(() => {
    replace.mockClear();
    queryClient.clear();
    useWishToastStore.setState({ pending: null });
    useWishOriginStore.setState({ recommendedProductIdByWishId: {} });
    useGiftChangeStore.getState().clear();
  });

  it("다른 선물 고르기에서 '상품 보기'로 왔다면 위시 상세 대신 그 펀딩의 위시 변경 화면으로 보낸다", async () => {
    useGiftChangeStore.getState().start(12, null);
    useGiftChangeStore.getState().setBrowsingProducts(true);
    vi.mocked(wishService.addWish).mockResolvedValue({ ...mockWish, id: 7 });
    const { result } = renderHook(() => useAddWishMutation(), { wrapper: createWrapper() });

    result.current.mutate({ recommendedProductId: 1 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(replace).toHaveBeenCalledWith("/funding/12/change-gift/wish/7");
    expect(useGiftChangeStore.getState().browsingProducts).toBe(false);
  });

  it("바꾸는 중인 펀딩이 있어도 '상품 보기'로 온 게 아니면 평소처럼 위시 상세로 보낸다", async () => {
    useGiftChangeStore.getState().start(12, null);
    vi.mocked(wishService.addWish).mockResolvedValue({ ...mockWish, id: 7 });
    const { result } = renderHook(() => useAddWishMutation(), { wrapper: createWrapper() });

    result.current.mutate({ recommendedProductId: 1 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(replace).toHaveBeenCalledWith("/wish/7");
  });

  it("mutate 호출 시 wishService.addWish가 전달받은 body로 호출된다", async () => {
    vi.mocked(wishService.addWish).mockResolvedValue(mockWish);
    const { result } = renderHook(() => useAddWishMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ recommendedProductId: 1 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(wishService.addWish).toHaveBeenCalledWith({ recommendedProductId: 1 });
  });

  it("성공 시 router.replace가 응답 id의 위시 상세(/wish/{id})로 호출된다", async () => {
    vi.mocked(wishService.addWish).mockResolvedValue({ ...mockWish, id: 7 });
    const { result } = renderHook(() => useAddWishMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ recommendedProductId: 1 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(replace).toHaveBeenCalledWith("/wish/7");
  });

  it("성공 시 추가 토스트를 예약하고 담은 추천 상품 id를 기록한다", async () => {
    vi.mocked(wishService.addWish).mockResolvedValue({ ...mockWish, id: 7 });
    const { result } = renderHook(() => useAddWishMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ recommendedProductId: 3 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useWishToastStore.getState().pending).toBe("added");
    expect(useWishOriginStore.getState().recommendedProductIdByWishId["7"]).toBe(3);
  });

  it("성공 시 위시 상세 쿼리 캐시(['wishes', String(id)])가 응답으로 미리 채워진다", async () => {
    vi.mocked(wishService.addWish).mockResolvedValue({ ...mockWish, id: 7 });
    const { result } = renderHook(() => useAddWishMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ recommendedProductId: 1 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(["wishes", "7"])).toEqual({ ...mockWish, id: 7 });
  });

  it("성공 시 위시 목록 쿼리들은 무효화되고 방금 채운 상세 캐시는 stale이 되지 않는다", async () => {
    vi.mocked(wishService.addWish).mockResolvedValue({ ...mockWish, id: 7 });
    queryClient.setQueryData(["wishes"], { content: [] });
    queryClient.setQueryData(["wishes", { size: 4 }], { pages: [], pageParams: [] });
    const { result } = renderHook(() => useAddWishMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ recommendedProductId: 1 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryState(["wishes"])?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(["wishes", { size: 4 }])?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(["wishes", "7"])?.isInvalidated).toBe(false);
  });

  it("성공 시 추천 상품 목록 쿼리가 무효화된다", async () => {
    vi.mocked(wishService.addWish).mockResolvedValue({ ...mockWish, id: 7 });
    queryClient.setQueryData(["recommended-products", undefined], []);
    const { result } = renderHook(() => useAddWishMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ recommendedProductId: 1 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryState(["recommended-products", undefined])?.isInvalidated).toBe(
      true,
    );
  });

  it("성공 응답의 data가 null이면 추천 목록(/wish/recommended)으로 되돌아간다", async () => {
    vi.mocked(wishService.addWish).mockResolvedValue(null);
    const { result } = renderHook(() => useAddWishMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ recommendedProductId: 1 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(replace).toHaveBeenCalledWith("/wish/recommended");
  });

  it("wishService.addWish가 실패하면 isError가 true가 되고 router.replace는 호출되지 않는다", async () => {
    const error = new Error("위시 담기 실패");
    vi.mocked(wishService.addWish).mockRejectedValue(error);
    const { result } = renderHook(() => useAddWishMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ recommendedProductId: 1 });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
    expect(replace).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(["wishes", "1"])).toBeUndefined();
  });
});
