import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useHomeFundingsQuery } from "@/hooks/queries/home/useHomeFundingsQuery";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import { useHomeWishesQuery } from "@/hooks/queries/wish/useHomeWishesQuery";
import type { HomeFundingCardType } from "@/types/home/home";
import type { WishResponse, WishStatus } from "@/types/wish/wish";
import HomeWishTab from "@/widgets/home/HomeWishTab";

vi.mock("@/hooks/queries/home/useHomeFundingsQuery");
vi.mock("@/hooks/queries/wish/useHomeWishesQuery");
vi.mock("@/hooks/queries/user/useMyProfileQuery");

const makeWish = (id: number, status: WishStatus): WishResponse => ({
  id,
  productName: `상품${id}`,
  productImageUrl: `/wish-${id}.png`,
  price: id * 1000,
  productUrl: "https://example.com",
  sellerName: "쿠팡",
  status,
  fundingId: status === "FUNDING" ? 1 : null,
});

const refetch = vi.fn();
const fetchNextPage = vi.fn();

const mockWishes = ({
  content,
  nextContent,
  totalElements,
  isError = false,
  hasNextPage = false,
  isFetchNextPageError = false,
}: {
  content?: WishResponse[];
  nextContent?: WishResponse[];
  totalElements?: number;
  isError?: boolean;
  hasNextPage?: boolean;
  isFetchNextPageError?: boolean;
}) => {
  const firstPage = content && {
    content,
    page: 0,
    size: 4,
    totalElements: totalElements ?? content.length,
    hasNext: hasNextPage,
  };
  vi.mocked(useHomeWishesQuery).mockReturnValue({
    data: content
      ? {
          pages: [
            firstPage,
            ...(nextContent
              ? [{ ...firstPage, content: nextContent, page: 1, hasNext: false }]
              : []),
          ],
          pageParams: [0, ...(nextContent ? [1] : [])],
        }
      : undefined,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage: false,
    isFetchNextPageError,
  } as unknown as ReturnType<typeof useHomeWishesQuery>);
};

const mockFundings = (cards?: [fundingId: number, cardType: HomeFundingCardType][]) => {
  vi.mocked(useHomeFundingsQuery).mockReturnValue({
    data: cards && {
      fundingCards: cards.map(([fundingId, cardType]) => ({ fundingId, cardType })),
    },
  } as unknown as ReturnType<typeof useHomeFundingsQuery>);
};

beforeEach(() => {
  vi.clearAllMocks();
  mockFundings([]);
  vi.mocked(useMyProfileQuery).mockReturnValue({
    data: { nickname: "지유", wishProfileUrl: "https://botem.site/@wish-key" },
  } as unknown as ReturnType<typeof useMyProfileQuery>);
});

describe("HomeWishTab", () => {
  it("닉네임 제목과 전체 위시 개수를 보여준다", () => {
    mockWishes({ content: [makeWish(1, "AVAILABLE")], totalElements: 12 });

    render(<HomeWishTab onAddWish={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "지유의 위시" })).toBeInTheDocument();
    expect(screen.getByText("위시 12개")).toBeInTheDocument();
    expect(screen.getByText("상품1")).toBeInTheDocument();
  });

  it("링크 아이콘을 누르면 내 위시 프로필 링크를 복사하고 완료 토스트를 보여준다", async () => {
    const user = userEvent.setup();
    mockWishes({ content: [makeWish(1, "AVAILABLE")] });
    render(<HomeWishTab onAddWish={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "위시 프로필 링크 복사" }));

    expect(await navigator.clipboard.readText()).toBe("https://botem.site/@wish-key");
    expect(await screen.findByText("위시 프로필 링크가 복사되었습니다")).toBeInTheDocument();
  });

  it("링크 복사에 실패하면 실패 토스트를 보여준다", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValueOnce(new Error("denied"));
    mockWishes({ content: [makeWish(1, "AVAILABLE")] });
    render(<HomeWishTab onAddWish={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "위시 프로필 링크 복사" }));

    expect(await screen.findByText("링크를 복사하지 못했어요")).toBeInTheDocument();
  });

  it("위시 카드는 각 위시의 상세 페이지(/wish/{id})로 연결된다", () => {
    mockWishes({ content: [makeWish(21, "AVAILABLE"), makeWish(22, "FUNDING")] });

    render(<HomeWishTab onAddWish={vi.fn()} />);

    expect(screen.getByRole("link", { name: /상품21/ })).toHaveAttribute("href", "/wish/21");
    expect(screen.getByRole("link", { name: /상품22/ })).toHaveAttribute("href", "/wish/22");
  });

  it("진행 중인 펀딩의 위시에만 '펀딩 중' 배지를 표시한다", () => {
    mockWishes({
      content: [
        { ...makeWish(1, "FUNDING"), fundingId: 1 },
        // 마감·조기 마감 후 팡을 열기 전
        { ...makeWish(2, "FUNDING"), fundingId: 2 },
        // 팡을 연 뒤라 홈 펀딩 카드에 없음
        { ...makeWish(3, "FUNDING"), fundingId: 3 },
        makeWish(4, "AVAILABLE"),
      ],
    });
    mockFundings([
      [1, "IN_PROGRESS"],
      [2, "CLOSED_UNOPENED"],
    ]);

    render(<HomeWishTab onAddWish={vi.fn()} />);

    expect(screen.getAllByText("펀딩 중")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /상품1/ })).toHaveTextContent("펀딩 중");
  });

  it("홈 펀딩을 받기 전이거나 조회에 실패하면 배지 없이 위시를 보여준다", () => {
    mockWishes({ content: [makeWish(1, "FUNDING")] });
    mockFundings(undefined);

    render(<HomeWishTab onAddWish={vi.fn()} />);

    expect(screen.getByText("상품1")).toBeInTheDocument();
    expect(screen.queryByText("펀딩 중")).not.toBeInTheDocument();
  });

  it("다음 페이지가 있으면 더 보기로 요청하고 받은 위시를 이어서 보여준다", async () => {
    mockWishes({ content: [makeWish(1, "AVAILABLE")], hasNextPage: true });
    const { rerender } = render(<HomeWishTab onAddWish={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "더 보기" }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);

    mockWishes({ content: [makeWish(1, "AVAILABLE")], nextContent: [makeWish(2, "AVAILABLE")] });
    rerender(<HomeWishTab onAddWish={vi.fn()} />);

    expect(screen.getByText("상품1")).toBeInTheDocument();
    expect(screen.getByText("상품2")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "더 보기" })).not.toBeInTheDocument();
  });

  it("다음 페이지 조회에 실패하면 기존 목록을 유지하고 다시 시도할 수 있다", async () => {
    mockWishes({ content: [makeWish(1, "AVAILABLE")], isError: true, isFetchNextPageError: true });
    render(<HomeWishTab onAddWish={vi.fn()} />);

    expect(screen.getByText("상품1")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it("위시가 없으면 빈 화면을 보여주고 '위시 추가하기'를 누르면 onAddWish를 호출한다", async () => {
    const onAddWish = vi.fn();
    mockWishes({ content: [] });

    render(<HomeWishTab onAddWish={onAddWish} />);
    await userEvent.click(screen.getByRole("button", { name: "위시 추가하기" }));

    expect(screen.queryByRole("heading", { name: "지유의 위시" })).not.toBeInTheDocument();
    expect(onAddWish).toHaveBeenCalledTimes(1);
  });

  it("재조회가 실패해도 이미 받은 위시가 있으면 목록을 계속 보여준다", () => {
    mockWishes({ content: [makeWish(1, "AVAILABLE")], isError: true });

    render(<HomeWishTab onAddWish={vi.fn()} />);

    expect(screen.getByText("상품1")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
  });

  it("조회가 실패하면 다시 시도로 위시를 다시 요청한다", async () => {
    mockWishes({ isError: true });

    render(<HomeWishTab onAddWish={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
