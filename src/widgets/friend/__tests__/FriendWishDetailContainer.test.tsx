import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { FriendProfileResponse, FriendWishDetailResponse } from "@/types/friend/friend";
import FriendWishDetailContainer from "@/widgets/friend/FriendWishDetailContainer";

const back = vi.fn();
const refetch = vi.fn();
const useFriendProfileQuery = vi.fn();
const useFriendWishQuery = vi.fn();
const windowOpen = vi.fn();

vi.mock("@/hooks/mutations/funding/useCreateFundingMutation", () => ({
  useCreateFundingMutation: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back, push: vi.fn() }),
}));
vi.mock("@/hooks/queries/friend/useFriendProfileQuery", () => ({
  useFriendProfileQuery: (friendId: string) => useFriendProfileQuery(friendId),
}));
vi.mock("@/hooks/queries/friend/useFriendWishQuery", () => ({
  useFriendWishQuery: (friendId: string, wishId: string) => useFriendWishQuery(friendId, wishId),
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
    },
  ],
  wishesVisible: true,
  wishCount: 1,
};

const wishDetail: FriendWishDetailResponse = {
  wishId: 1,
  productName: "모자",
  productImageUrl: "https://example.com/hat.png",
  price: 429000,
  productUrl: "https://link.coupang.com/a/example",
  sellerName: "쿠팡 Apple 공식 브랜드관",
  activeSurpriseFundingId: null,
};

type QueryState<T> = { data?: T; isPending?: boolean };

const mockQuery = (
  state: QueryState<FriendProfileResponse>,
  wishState: QueryState<FriendWishDetailResponse> = { data: wishDetail },
) => {
  const base = { data: undefined, isPending: false, refetch };
  useFriendProfileQuery.mockReturnValue({ ...base, ...state });
  useFriendWishQuery.mockReturnValue({ ...base, ...wishState });
};

describe("FriendWishDetailContainer", () => {
  beforeEach(() => {
    back.mockClear();
    refetch.mockClear();
    windowOpen.mockClear();
    vi.stubGlobal("open", windowOpen);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("불러오는 중이면 스켈레톤을 보여준다", () => {
    mockQuery({ isPending: true });
    render(<FriendWishDetailContainer friendId="5" wishId="1" />);

    expect(screen.queryByText("모자")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "친구 몰래 서프라이즈 열기" }),
    ).not.toBeInTheDocument();
  });

  it("위시 상세 조회에 실패하면 안내 문구를 보여주고 다시 시도하면 실패한 조회만 refetch한다", async () => {
    mockQuery({ data: profile }, { data: undefined });
    render(<FriendWishDetailContainer friendId="5" wishId="1" />);

    expect(screen.getByText("위시 정보를 불러오지 못했어요")).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "다시 시도" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("프로필 조회에 실패해도 안내 문구를 보여준다", () => {
    mockQuery({ data: undefined });
    render(<FriendWishDetailContainer friendId="5" wishId="1" />);

    expect(screen.getByText("위시 정보를 불러오지 못했어요")).toBeInTheDocument();
  });

  it("route의 friendId·wishId로 조회하고 위시 상품명·가격·판매처와 서프라이즈 CTA를 보여준다", () => {
    mockQuery({ data: profile });
    render(<FriendWishDetailContainer friendId="5" wishId="1" />);

    expect(useFriendProfileQuery).toHaveBeenCalledWith("5");
    expect(useFriendWishQuery).toHaveBeenCalledWith("5", "1");
    expect(screen.getByText("모자")).toBeInTheDocument();
    expect(screen.getByText("429,000원")).toBeInTheDocument();
    expect(screen.getByText("쿠팡 Apple 공식 브랜드관")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "친구 몰래 서프라이즈 열기" })).toBeInTheDocument();
  });

  it("판매처를 누르면 상품 링크를 새 탭으로 연다", async () => {
    mockQuery({ data: profile });
    render(<FriendWishDetailContainer friendId="5" wishId="1" />);

    await userEvent.setup().click(screen.getByText("쿠팡 Apple 공식 브랜드관"));

    expect(windowOpen).toHaveBeenCalledWith(
      "https://link.coupang.com/a/example",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("상품 링크가 http(s)가 아니면 판매처 버튼을 비활성화한다", () => {
    mockQuery({ data: profile }, { data: { ...wishDetail, productUrl: "javascript:alert(1)" } });
    render(<FriendWishDetailContainer friendId="5" wishId="1" />);

    expect(screen.getByRole("button", { name: /쿠팡 Apple 공식 브랜드관/ })).toBeDisabled();
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
