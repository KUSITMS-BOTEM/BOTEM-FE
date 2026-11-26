import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ApiError } from "@/types/api";
import type { FriendProfileResponse, FriendWishDetailResponse } from "@/types/friend/friend";
import FriendWishDetailContainer from "@/widgets/friend/FriendWishDetailContainer";

const back = vi.fn();
const refetch = vi.fn();
const useFriendProfileQuery = vi.fn();
const useFriendWishQuery = vi.fn();
const windowOpen = vi.fn();

vi.mock("@/hooks/mutations/funding/useCreateSurpriseFundingMutation", () => ({
  useCreateSurpriseFundingMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
const push = vi.fn();
const notFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back, push }),
  notFound: () => notFound(),
}));
vi.mock("@/hooks/queries/friend/useFriendProfileQuery", () => ({
  useFriendProfileQuery: (friendId: string) => useFriendProfileQuery(friendId),
}));
vi.mock("@/hooks/queries/friend/useFriendWishQuery", () => ({
  useFriendWishQuery: (friendId: string, wishId: string) => useFriendWishQuery(friendId, wishId),
}));
const useHomeFundingsQuery = vi.fn();
vi.mock("@/hooks/queries/home/useHomeFundingsQuery", () => ({
  useHomeFundingsQuery: () => useHomeFundingsQuery(),
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
    push.mockClear();
    notFound.mockClear();
    windowOpen.mockClear();
    vi.stubGlobal("open", windowOpen);
    useHomeFundingsQuery.mockReturnValue({ data: { canOpenFunding: true }, isPending: false });
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

  it("위시 상세가 FRIEND_002(친구가 아님)로 실패하면 notFound를 호출한다", () => {
    mockQuery({ data: profile }, {
      data: undefined,
      error: new ApiError("FRIEND_002"),
    } as QueryState<FriendWishDetailResponse>);

    expect(() => render(<FriendWishDetailContainer friendId="5" wishId="1" />)).toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(notFound).toHaveBeenCalled();
  });

  it("진행 중인 서프라이즈가 있으면 CTA가 '같이 보태기'가 되어 그 펀딩으로 이동한다", async () => {
    mockQuery({ data: profile }, { data: { ...wishDetail, activeSurpriseFundingId: 77 } });
    render(<FriendWishDetailContainer friendId="5" wishId="1" />);

    expect(
      screen.queryByRole("button", { name: "친구 몰래 서프라이즈 열기" }),
    ).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "같이 보태기" }));

    expect(push).toHaveBeenCalledWith("/share/77");
  });

  it("개설 한도에 걸리면 서프라이즈 CTA를 비활성화하고 안내 문구를 보여준다", () => {
    useHomeFundingsQuery.mockReturnValue({ data: { canOpenFunding: false }, isPending: false });
    mockQuery({ data: profile });
    render(<FriendWishDetailContainer friendId="5" wishId="1" />);

    expect(screen.getByRole("button", { name: "친구 몰래 서프라이즈 열기" })).toBeDisabled();
    expect(screen.getByText("펀딩은 최대 5개까지만 열 수 있어요")).toBeInTheDocument();
  });

  it("개설 한도에 걸려도 '같이 보태기'는 막지 않는다", () => {
    useHomeFundingsQuery.mockReturnValue({ data: { canOpenFunding: false }, isPending: false });
    mockQuery({ data: profile }, { data: { ...wishDetail, activeSurpriseFundingId: 77 } });
    render(<FriendWishDetailContainer friendId="5" wishId="1" />);

    expect(screen.getByRole("button", { name: "같이 보태기" })).toBeEnabled();
    expect(screen.queryByText("펀딩은 최대 5개까지만 열 수 있어요")).not.toBeInTheDocument();
  });

  it("개설 가능 여부를 조회하는 동안에는 서프라이즈 CTA를 비활성화한다", () => {
    useHomeFundingsQuery.mockReturnValue({ data: undefined, isPending: true });
    mockQuery({ data: profile });
    render(<FriendWishDetailContainer friendId="5" wishId="1" />);

    expect(screen.getByRole("button", { name: "친구 몰래 서프라이즈 열기" })).toBeDisabled();
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

  it("서프라이즈 CTA를 누르면 위시 선택 없이 금액 정보 단계가 열린다", async () => {
    mockQuery({ data: profile });
    render(<FriendWishDetailContainer friendId="5" wishId="1" />);

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "친구 몰래 서프라이즈 열기" }));

    expect(await screen.findByText("금액 정보")).toBeInTheDocument();
    expect(screen.getByText("목표 금액은 얼마인가요?")).toBeInTheDocument();
  });
});
