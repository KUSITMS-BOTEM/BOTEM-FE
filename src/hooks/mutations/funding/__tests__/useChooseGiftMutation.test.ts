import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { fundingService } from "@/apis/funding/fundingService";
import { useChooseGiftMutation } from "@/hooks/mutations/funding/useChooseGiftMutation";
import { fundingManagementQueryKey } from "@/hooks/queries/funding/useFundingManagementQuery";
import { surpriseRevealQueryKey } from "@/hooks/queries/funding/useSurpriseRevealQuery";
import { homeQueryKey } from "@/hooks/queries/home/useHomeFundingsQuery";

vi.mock("@/apis/funding/fundingService", () => ({
  fundingService: { chooseGift: vi.fn() },
}));

const response = {
  fundingId: 7,
  giftVerificationId: 3,
  productName: "다이슨 에어랩",
  productImageUrl: "https://image.example.com/product.jpg",
  productUrl: "https://www.coupang.com/vp/products/1",
};

let queryClient: QueryClient;
const createWrapper = () =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  vi.mocked(fundingService.chooseGift).mockReset();
});

describe("useChooseGiftMutation", () => {
  it("펀딩의 지금 상품을 선물로 정해 달라고 요청한다", async () => {
    vi.mocked(fundingService.chooseGift).mockResolvedValue(response);
    const { result } = renderHook(() => useChooseGiftMutation(7), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fundingService.chooseGift).toHaveBeenCalledWith(7);
    expect(result.current.data).toEqual(response);
  });

  it("성공하면 연장 가능 여부가 바뀐 관리 상세·서프라이즈 공개 상세와 인증 배너로 옮겨 간 홈을 무효화한다", async () => {
    vi.mocked(fundingService.chooseGift).mockResolvedValue(response);
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useChooseGiftMutation(7), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: fundingManagementQueryKey(7) });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: homeQueryKey });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: surpriseRevealQueryKey(7) });
  });
});
