import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useChangeFundingProductMutation } from "@/hooks/mutations/funding/useChangeFundingProductMutation";
import { useFundingManagementQuery } from "@/hooks/queries/funding/useFundingManagementQuery";
import { useFundingResultQuery } from "@/hooks/queries/funding/useFundingResultQuery";
import { useWishesQuery } from "@/hooks/queries/wish/useWishesQuery";
import { useGiftChangeStore } from "@/store/giftChangeStore";
import type { FundingManagementResponse, FundingResultResponse } from "@/types/funding/funding";
import type { WishResponse } from "@/types/wish/wish";
import FundingGiftChangeContainer from "@/widgets/funding/FundingGiftChangeContainer";

const back = vi.fn();
const push = vi.fn();
const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back, push, replace }),
  useParams: () => ({ fundingId: "7" }),
}));
vi.mock("@/hooks/queries/funding/useFundingResultQuery", () => ({
  useFundingResultQuery: vi.fn(),
}));
vi.mock("@/hooks/queries/funding/useFundingManagementQuery", () => ({
  useFundingManagementQuery: vi.fn(),
}));
vi.mock("@/hooks/queries/wish/useWishesQuery", () => ({ useWishesQuery: vi.fn() }));
vi.mock("@/hooks/mutations/funding/useChangeFundingProductMutation", () => ({
  useChangeFundingProductMutation: vi.fn(),
}));

const wish = (overrides: Partial<WishResponse>): WishResponse => ({
  id: 1,
  productName: "상품",
  productImageUrl: "https://example.com/1.png",
  price: 100000,
  productUrl: "https://example.com/1",
  sellerName: null,
  status: "AVAILABLE",
  fundingId: null,
  ...overrides,
});

const fundingWish = wish({
  id: 2,
  productName: "다이슨 에어랩",
  price: 659000,
  status: "FUNDING",
  fundingId: 7,
});
const mockWishes = [
  fundingWish,
  wish({ id: 1, productName: "에어팟 프로 3", price: 359000 }),
  wish({ id: 3, productName: "닌텐도 스위치 2", price: 592000 }),
];
const mockResult = { confirmedAmount: 501000 } as FundingResultResponse;
const mockManagement = {
  product: {
    name: "다이슨 에어랩",
    imageUrl: "https://example.com/2.png",
    price: 659000,
    url: "https://example.com",
  },
  productChanged: false,
} as FundingManagementResponse;

const changeMutate = vi.fn();
const wishesRefetch = vi.fn();

const mockQueries = ({
  wishes = mockWishes as WishResponse[] | null,
  management = mockManagement,
  isLoading = false,
} = {}) => {
  vi.mocked(useFundingResultQuery).mockReturnValue({
    data: isLoading ? undefined : mockResult,
    isLoading,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useFundingResultQuery>);
  vi.mocked(useFundingManagementQuery).mockReturnValue({
    data: isLoading ? undefined : management,
    isLoading,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useFundingManagementQuery>);
  vi.mocked(useWishesQuery).mockReturnValue({
    data: wishes && { content: wishes },
    isLoading,
    refetch: wishesRefetch,
  } as unknown as ReturnType<typeof useWishesQuery>);
  vi.mocked(useChangeFundingProductMutation).mockReturnValue({
    mutate: changeMutate,
    isPending: false,
    isSuccess: false,
  } as unknown as ReturnType<typeof useChangeFundingProductMutation>);
};

beforeEach(() => {
  vi.clearAllMocks();
  useGiftChangeStore.getState().clear();
});

describe("FundingGiftChangeContainer", () => {
  it("불러오는 중에는 로딩 상태를 알린다", () => {
    mockQueries({ isLoading: true });
    render(<FundingGiftChangeContainer />);

    expect(screen.getByRole("status")).toHaveTextContent("고를 수 있는 선물을 불러오는 중이에요");
  });

  it("위시를 불러오지 못하면 안내와 다시 시도를 보여준다", async () => {
    mockQueries({ wishes: null });
    render(<FundingGiftChangeContainer />);

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(screen.getByText("선물 정보를 불러오지 못했어요")).toBeInTheDocument();
    expect(wishesRefetch).toHaveBeenCalledTimes(1);
  });

  it("모인 금액 안에서 고를 수 있는 위시만 보여주고 지금 선물은 기존 선물로 보여준다", () => {
    mockQueries();
    render(<FundingGiftChangeContainer />);

    expect(screen.getByText(/모인 501,000원 안에서/)).toBeInTheDocument();
    expect(screen.getByText("다이슨 에어랩")).toBeInTheDocument();
    expect(screen.getByText("기존 선물")).toBeInTheDocument();
    expect(screen.getByText("에어팟 프로 3")).toBeInTheDocument();
    expect(screen.queryByText("닌텐도 스위치 2")).not.toBeInTheDocument();
  });

  it("처음 들어오면 지금 선물을 되돌아갈 기존 선물로 기록한다", () => {
    mockQueries();
    render(<FundingGiftChangeContainer />);

    expect(useGiftChangeStore.getState()).toMatchObject({
      fundingId: 7,
      originalGift: { wishId: 2, productName: "다이슨 에어랩", price: 659000 },
    });
  });

  it("고를 수 있는 위시가 없으면 위시 목록 없이 상품 보기 안내만 보여준다", () => {
    mockQueries({ wishes: [fundingWish] });
    render(<FundingGiftChangeContainer />);

    expect(screen.queryByText("위시에서 다른 상품 고르기")).not.toBeInTheDocument();
    expect(screen.getByText("위시 상품을 찾아볼까요?")).toBeInTheDocument();
  });

  it("위시를 고르면 그 위시의 변경 화면으로 이동한다", async () => {
    mockQueries();
    render(<FundingGiftChangeContainer />);

    await userEvent.click(screen.getByRole("button", { name: "에어팟 프로 3 선택" }));

    expect(push).toHaveBeenCalledWith("/funding/7/change-gift/wish/1");
  });

  it("바꾼 적 없이 기존 선물을 고르면 요청 없이 선물 확인으로 돌아간다", async () => {
    mockQueries();
    render(<FundingGiftChangeContainer />);

    await userEvent.click(screen.getByRole("button", { name: "다이슨 에어랩 선택" }));

    expect(changeMutate).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith("/funding/7/result");
  });

  it("다른 위시로 바꾼 뒤 기존 선물을 고르면 기존 위시로 되돌리고 선물 확인으로 돌아간다", async () => {
    useGiftChangeStore.getState().start(7, {
      wishId: 2,
      productName: "다이슨 에어랩",
      price: 659000,
      productImageUrl: "https://example.com/2.png",
    });
    mockQueries({
      wishes: [
        wish({ id: 2, productName: "다이슨 에어랩", price: 659000 }),
        wish({
          id: 1,
          productName: "에어팟 프로 3",
          price: 359000,
          status: "FUNDING",
          fundingId: 7,
        }),
      ],
      management: { ...mockManagement, productChanged: true },
    });
    changeMutate.mockImplementation((_wishId: number, options: { onSuccess: () => void }) =>
      options.onSuccess(),
    );
    render(<FundingGiftChangeContainer />);

    await userEvent.click(screen.getByRole("button", { name: "다이슨 에어랩 선택" }));

    expect(changeMutate.mock.calls[0][0]).toBe(2);
    expect(replace).toHaveBeenCalledWith("/funding/7/result");
  });

  it("'상품 보기'를 누르면 상품 보기 중으로 표시하고 추천 상품 목록으로 이동한다", async () => {
    mockQueries();
    render(<FundingGiftChangeContainer />);

    await userEvent.click(screen.getByRole("button", { name: /상품 보기/ }));

    expect(useGiftChangeStore.getState().browsingProducts).toBe(true);
    expect(push).toHaveBeenCalledWith("/wish/recommended");
  });

  it("뒤로 가기를 누르면 router.back이 호출된다", async () => {
    mockQueries();
    render(<FundingGiftChangeContainer />);

    await userEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));

    expect(back).toHaveBeenCalledTimes(1);
  });
});
