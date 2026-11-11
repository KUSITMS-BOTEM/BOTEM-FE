import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import { useWishesQuery } from "@/hooks/queries/wish/useWishesQuery";
import type { WishResponse, WishStatus } from "@/types/wish/wish";
import HomeWishTab from "@/widgets/home/HomeWishTab";

vi.mock("@/hooks/queries/wish/useWishesQuery");
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

const mockWishes = ({
  content,
  totalElements,
  isError = false,
}: {
  content?: WishResponse[];
  totalElements?: number;
  isError?: boolean;
}) => {
  vi.mocked(useWishesQuery).mockReturnValue({
    data: content
      ? {
          content,
          page: 0,
          size: 10,
          totalElements: totalElements ?? content.length,
          hasNext: false,
        }
      : undefined,
    isError,
    refetch,
  } as unknown as ReturnType<typeof useWishesQuery>);
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useMyProfileQuery).mockReturnValue({
    data: { nickname: "지유" },
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

  it("펀딩 중인 위시에만 '펀딩 중' 배지를 표시한다", () => {
    mockWishes({ content: [makeWish(1, "FUNDING"), makeWish(2, "AVAILABLE")] });

    render(<HomeWishTab onAddWish={vi.fn()} />);

    expect(screen.getAllByText("펀딩 중")).toHaveLength(1);
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
