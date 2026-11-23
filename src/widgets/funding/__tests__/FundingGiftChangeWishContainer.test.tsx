import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useChangeFundingProductMutation } from "@/hooks/mutations/funding/useChangeFundingProductMutation";
import { useChooseGiftMutation } from "@/hooks/mutations/funding/useChooseGiftMutation";
import { useFundingManagementQuery } from "@/hooks/queries/funding/useFundingManagementQuery";
import { useFundingResultQuery } from "@/hooks/queries/funding/useFundingResultQuery";
import { useWishQuery } from "@/hooks/queries/wish/useWishQuery";
import { useGiftChangeStore } from "@/store/giftChangeStore";
import type { OwnerFundingDetailResponse } from "@/types/funding/ownerFundingDetail";
import type { FundingResultResponse } from "@/types/funding/fundingResult";
import type { WishResponse } from "@/types/wish/wish";
import FundingGiftChangeWishContainer from "@/widgets/funding/FundingGiftChangeWishContainer";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useParams: () => ({ fundingId: "7", wishId: "1" }),
}));
vi.mock("@/hooks/queries/wish/useWishQuery", () => ({ useWishQuery: vi.fn() }));
vi.mock("@/hooks/queries/funding/useFundingResultQuery", () => ({
  useFundingResultQuery: vi.fn(),
}));
vi.mock("@/hooks/queries/funding/useFundingManagementQuery", () => ({
  useFundingManagementQuery: vi.fn(),
}));
vi.mock("@/hooks/mutations/funding/useChangeFundingProductMutation", () => ({
  useChangeFundingProductMutation: vi.fn(),
}));
vi.mock("@/hooks/mutations/funding/useChooseGiftMutation", () => ({
  useChooseGiftMutation: vi.fn(),
}));

const mockWish: WishResponse = {
  id: 1,
  productName: "에어팟 프로 3",
  productImageUrl: "https://example.com/1.png",
  price: 359000,
  productUrl: "https://www.coupang.com/vp/products/1",
  sellerName: "쿠팡 Apple 공식 브랜드관",
  status: "AVAILABLE",
  fundingId: null,
};
const mockManagement = {
  product: {
    name: "다이슨 에어랩",
    imageUrl: "https://example.com/2.png",
    price: 659000,
    url: "https://example.com",
  },
  productChanged: false,
} as OwnerFundingDetailResponse;

const changeMutate = vi.fn();
const chooseGiftMutate = vi.fn();

const mockQueries = ({
  wish = mockWish as WishResponse | null,
  isLoading = false,
  isPending = false,
  isSuccess = false,
  chooseGiftPending = false,
} = {}) => {
  vi.mocked(useWishQuery).mockReturnValue({
    data: wish,
    isLoading,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useWishQuery>);
  vi.mocked(useFundingResultQuery).mockReturnValue({
    data: { confirmedAmount: 501000 } as FundingResultResponse,
  } as unknown as ReturnType<typeof useFundingResultQuery>);
  vi.mocked(useFundingManagementQuery).mockReturnValue({
    data: mockManagement,
  } as unknown as ReturnType<typeof useFundingManagementQuery>);
  vi.mocked(useChangeFundingProductMutation).mockReturnValue({
    mutate: changeMutate,
    isPending,
    isSuccess,
  } as unknown as ReturnType<typeof useChangeFundingProductMutation>);
  vi.mocked(useChooseGiftMutation).mockReturnValue({
    mutate: chooseGiftMutate,
    isPending: chooseGiftPending,
  } as unknown as ReturnType<typeof useChooseGiftMutation>);
};

beforeEach(() => {
  vi.clearAllMocks();
  useGiftChangeStore.getState().clear();
});

describe("FundingGiftChangeWishContainer", () => {
  it("로딩 중에는 상품 정보 대신 스켈레톤을 보여준다", () => {
    mockQueries({ wish: null, isLoading: true });
    render(<FundingGiftChangeWishContainer />);

    expect(screen.queryByRole("button", { name: "이 선물로 변경하기" })).not.toBeInTheDocument();
  });

  it("위시를 불러오지 못하면 안내를 보여준다", () => {
    mockQueries({ wish: null });
    render(<FundingGiftChangeWishContainer />);

    expect(screen.getByText("상품 정보를 불러오지 못했어요")).toBeInTheDocument();
  });

  it("바꾸기 전에는 '이 선물로 변경하기'를 보여주고 누르면 이 위시로 변경을 요청한다", async () => {
    mockQueries();
    render(<FundingGiftChangeWishContainer />);

    await userEvent.click(screen.getByRole("button", { name: "이 선물로 변경하기" }));

    expect(changeMutate).toHaveBeenCalledWith(1);
  });

  it("변경 요청 중에는 버튼을 다시 누를 수 없다", () => {
    mockQueries({ isPending: true });
    render(<FundingGiftChangeWishContainer />);

    expect(screen.getByRole("button", { name: /이 선물로 변경하기/ })).toBeDisabled();
  });

  it("바꾼 뒤 쿠팡 구매 버튼을 누르면 빈 탭을 먼저 열고, 선물 선택이 저장되면 응답의 상품 링크로 보낸다", async () => {
    mockQueries({ isSuccess: true });
    const tab = { opener: {}, location: { href: "" }, close: vi.fn() } as unknown as Window;
    const open = vi.spyOn(window, "open").mockImplementation(() => tab);
    render(<FundingGiftChangeWishContainer />);

    expect(screen.getByText("24시간 안에 구매 후 인증해 주세요")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "쿠팡에서 선물 사러 가기" }));

    expect(open).toHaveBeenCalledWith("", "_blank");
    expect(chooseGiftMutate).toHaveBeenCalledTimes(1);
    const { onSuccess } = chooseGiftMutate.mock.lastCall![1] as {
      onSuccess: (data: { productUrl: string }) => void;
    };
    onSuccess({ productUrl: mockWish.productUrl });
    expect(tab.location.href).toBe(mockWish.productUrl);
    open.mockRestore();
  });

  it("선물 선택을 저장하는 중에는 쿠팡 구매 버튼을 다시 누를 수 없다", () => {
    mockQueries({ isSuccess: true, chooseGiftPending: true });
    render(<FundingGiftChangeWishContainer />);

    expect(screen.getByRole("button", { name: /쿠팡에서 선물 사러 가기/ })).toBeDisabled();
  });

  it("이미 이 펀딩의 선물인 위시로 들어오면 바로 구매 버튼을 보여준다", () => {
    mockQueries({ wish: { ...mockWish, status: "FUNDING", fundingId: 7 } });
    render(<FundingGiftChangeWishContainer />);

    expect(screen.getByRole("button", { name: "쿠팡에서 선물 사러 가기" })).toBeInTheDocument();
  });

  it("'기존 선물 보기'를 누르면 모인 금액과 기존 선물을 담은 바텀시트를 연다", async () => {
    mockQueries();
    render(<FundingGiftChangeWishContainer />);

    await userEvent.click(screen.getByRole("button", { name: /기존 선물 보기/ }));

    expect(screen.getByText("총 501,000원이 모였어요")).toBeInTheDocument();
    expect(screen.getByText("다이슨 에어랩")).toBeInTheDocument();
  });

  it("기록해 둔 기존 선물이 있으면 바꾼 뒤에도 그 선물을 보여준다", async () => {
    useGiftChangeStore.getState().start(7, {
      wishId: 5,
      productName: "르크루제 머그",
      price: 39000,
      productImageUrl: "https://example.com/5.png",
    });
    mockQueries({ isSuccess: true });
    render(<FundingGiftChangeWishContainer />);

    await userEvent.click(screen.getByRole("button", { name: /기존 선물 보기/ }));

    expect(screen.getByText("르크루제 머그")).toBeInTheDocument();
  });

  it("뒤로 가기를 누르면 선물 확인 화면으로 돌아간다", async () => {
    mockQueries();
    render(<FundingGiftChangeWishContainer />);

    await userEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/funding/7/result"));
  });
});
