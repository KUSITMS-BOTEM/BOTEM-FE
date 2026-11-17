import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { FriendProfileResponse } from "@/types/friend/friend";
import FriendWishDetailContainer from "@/widgets/friend/FriendWishDetailContainer";

const back = vi.fn();
const refetch = vi.fn();
const useFriendProfileQuery = vi.fn();
const notFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back, push: vi.fn() }),
  notFound: () => notFound(),
}));
vi.mock("@/hooks/queries/friend/useFriendProfileQuery", () => ({
  useFriendProfileQuery: (friendId: string) => useFriendProfileQuery(friendId),
}));
vi.mock("@/hooks/queries/payout-account/usePayoutAccountsQuery", () => ({
  usePayoutAccountsQuery: vi.fn(() => ({ data: [] })),
}));

const profile: FriendProfileResponse = {
  userId: 5,
  name: "지유",
  profileImageUrl: null,
  birthday: "10-24",
  birthdayDday: 3,
  fundings: [],
  wishes: [
    {
      wishId: 1,
      productName: "모자",
      productImageUrl: "https://example.com/hat.png",
      price: 429000,
      sellerName: "쿠팡 Apple 공식 브랜드관",
      productUrl: "https://link.coupang.com/a/example",
    },
  ],
};

const mockQuery = (state: { data?: FriendProfileResponse; isPending?: boolean }) =>
  useFriendProfileQuery.mockReturnValue({ data: undefined, isPending: false, refetch, ...state });

describe("FriendWishDetailContainer", () => {
  beforeEach(() => {
    back.mockClear();
    refetch.mockClear();
  });

  it("불러오는 중이면 스켈레톤을 보여준다", () => {
    mockQuery({ isPending: true });
    render(<FriendWishDetailContainer friendId="5" wishId="1" />);

    expect(screen.queryByText("모자")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "친구 몰래 서프라이즈 열기" }),
    ).not.toBeInTheDocument();
  });

  it("조회에 실패하면 안내 문구를 보여주고 다시 시도하면 refetch를 호출한다", async () => {
    mockQuery({ data: undefined });
    render(<FriendWishDetailContainer friendId="5" wishId="1" />);

    expect(screen.getByText("위시 정보를 불러오지 못했어요")).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "다시 시도" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("친구 위시에 없는 wishId면 notFound를 호출한다", () => {
    mockQuery({ data: profile });

    expect(() => render(<FriendWishDetailContainer friendId="5" wishId="999" />)).toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(notFound).toHaveBeenCalled();
  });

  it("route의 friendId로 조회하고 위시 상품명·가격·판매처와 서프라이즈 CTA를 보여준다", () => {
    mockQuery({ data: profile });
    render(<FriendWishDetailContainer friendId="5" wishId="1" />);

    expect(useFriendProfileQuery).toHaveBeenCalledWith("5");
    expect(screen.getByText("모자")).toBeInTheDocument();
    expect(screen.getByText("429,000원")).toBeInTheDocument();
    expect(screen.getByText("쿠팡 Apple 공식 브랜드관")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "친구 몰래 서프라이즈 열기" })).toBeInTheDocument();
  });

  it("서프라이즈 CTA를 누르면 위시 선택 없이 펀딩 정보 단계가 열린다", async () => {
    mockQuery({ data: profile });
    render(<FriendWishDetailContainer friendId="5" wishId="1" />);

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "친구 몰래 서프라이즈 열기" }));

    expect(await screen.findByText("펀딩 정보")).toBeInTheDocument();
    expect(screen.getByText("목표 금액은 얼마인가요?")).toBeInTheDocument();
  });
});
