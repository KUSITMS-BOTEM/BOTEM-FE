import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { FriendWishDetailResponse } from "@/types/friend/friend";
import FriendWishDetailContainer from "@/widgets/friend/FriendWishDetailContainer";

const back = vi.fn();
const refetch = vi.fn();
const useFriendWishQuery = vi.fn();
const useFriendProfileQuery = vi.fn();

vi.mock("@/hooks/mutations/funding/useCreateFundingMutation", () => ({
  useCreateFundingMutation: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back, push: vi.fn() }),
}));
vi.mock("@/hooks/queries/friend/useFriendWishQuery", () => ({
  useFriendWishQuery: (friendId: string, wishId: string) => useFriendWishQuery(friendId, wishId),
}));
vi.mock("@/hooks/queries/friend/useFriendProfileQuery", () => ({
  useFriendProfileQuery: (friendId: string) => useFriendProfileQuery(friendId),
}));
vi.mock("@/hooks/queries/payout-account/usePayoutAccountsQuery", () => ({
  usePayoutAccountsQuery: vi.fn(() => ({ data: [] })),
}));

const wish: FriendWishDetailResponse = {
  wishId: 1,
  productName: "모자",
  productImageUrl: "https://example.com/hat.png",
  price: 429000,
  sellerName: "쿠팡 Apple 공식 브랜드관",
  productUrl: "https://link.coupang.com/a/example",
  activeSurpriseFundingId: null,
};

const mockQuery = (state: { data?: FriendWishDetailResponse; isPending?: boolean }) =>
  useFriendWishQuery.mockReturnValue({ data: undefined, isPending: false, refetch, ...state });

describe("FriendWishDetailContainer", () => {
  beforeEach(() => {
    back.mockClear();
    refetch.mockClear();
    useFriendProfileQuery.mockReturnValue({ data: { name: "지유" } });
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

  it("route의 friendId·wishId로 조회하고 위시 상품명·가격·판매처와 서프라이즈 CTA를 보여준다", () => {
    mockQuery({ data: wish });
    render(<FriendWishDetailContainer friendId="5" wishId="1" />);

    expect(useFriendWishQuery).toHaveBeenCalledWith("5", "1");
    expect(screen.getByText("모자")).toBeInTheDocument();
    expect(screen.getByText("429,000원")).toBeInTheDocument();
    expect(screen.getByText("쿠팡 Apple 공식 브랜드관")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "친구 몰래 서프라이즈 열기" })).toBeInTheDocument();
  });

  it("친구 프로필을 불러오는 중이면 서프라이즈 CTA가 로딩 상태로 막힌다", () => {
    useFriendProfileQuery.mockReturnValue({ data: undefined, isPending: true });
    mockQuery({ data: wish });
    render(<FriendWishDetailContainer friendId="5" wishId="1" />);

    const cta = screen.getByRole("button", { name: "친구 몰래 서프라이즈 열기" });
    expect(cta).toBeDisabled();
    expect(cta).toHaveAttribute("aria-busy", "true");
  });

  it("친구 프로필 조회에 실패하면 서프라이즈 CTA가 비활성화된다", () => {
    useFriendProfileQuery.mockReturnValue({ data: undefined, isPending: false });
    mockQuery({ data: wish });
    render(<FriendWishDetailContainer friendId="5" wishId="1" />);

    expect(screen.getByRole("button", { name: "친구 몰래 서프라이즈 열기" })).toBeDisabled();
  });

  it("서프라이즈 CTA를 누르면 위시 선택 없이 펀딩 정보 단계가 열린다", async () => {
    mockQuery({ data: wish });
    render(<FriendWishDetailContainer friendId="5" wishId="1" />);

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "친구 몰래 서프라이즈 열기" }));

    expect(await screen.findByText("펀딩 정보")).toBeInTheDocument();
    expect(screen.getByText("목표 금액은 얼마인가요?")).toBeInTheDocument();
  });
});
