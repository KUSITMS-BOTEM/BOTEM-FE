import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useLogoutMutation } from "@/hooks/mutations/auth/useLogoutMutation";
import { useFriendsQuery } from "@/hooks/queries/friend/useFriendsQuery";
import { usePayoutAccountsQuery } from "@/hooks/queries/payout-account/usePayoutAccountsQuery";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import { useFriendsEntryStore } from "@/store/friendsEntryStore";
import type { PayoutAccountResponse } from "@/types/payout-account/payoutAccount";
import type { MyProfile } from "@/types/user/profile";
import MyMenuSheet from "@/widgets/user/MyMenuSheet";

const replace = vi.fn();
const push = vi.fn();
const logout = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, push }) }));
vi.mock("@/hooks/mutations/auth/useLogoutMutation");
vi.mock("@/hooks/queries/friend/useFriendsQuery");
vi.mock("@/hooks/queries/payout-account/usePayoutAccountsQuery");
vi.mock("@/hooks/queries/user/useMyProfileQuery");
vi.mock("@/widgets/funding/ClosedFundingSheet", () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>마감된 펀딩 시트</div> : null),
}));
vi.mock("@/widgets/payout-account/PayoutAccountEditSheet", () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>대표 계좌 시트</div> : null),
}));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

const PROFILE: MyProfile = {
  nickname: "지유",
  name: null,
  profileImageUrl: null,
  birthday: "10-13",
  wishProfileUrl: "https://botem.site/@jiyu",
  kakaoConnected: true,
  email: null,
  joinedAt: "2025-01-01",
};

const ACCOUNT: PayoutAccountResponse = {
  id: 1,
  bank: "TOSS_BANK",
  bankName: "토스뱅크",
  accountNumber: "100159014821",
  accountHolder: "지유",
  isDefault: true,
  verificationStatus: "UNVERIFIED",
};

const mockQueries = (profile: MyProfile, accounts: PayoutAccountResponse[]) => {
  vi.mocked(useMyProfileQuery).mockReturnValue({ data: profile } as unknown as ReturnType<
    typeof useMyProfileQuery
  >);
  vi.mocked(usePayoutAccountsQuery).mockReturnValue({ data: accounts } as unknown as ReturnType<
    typeof usePayoutAccountsQuery
  >);
};

const mockFriendsQuery = (state: { data?: { totalCount: number }; isPending: boolean }) => {
  vi.mocked(useFriendsQuery).mockReturnValue(
    state as unknown as ReturnType<typeof useFriendsQuery>,
  );
};

const renderSheet = (open = true) =>
  render(<MyMenuSheet open={open} onClose={vi.fn()} closedFundingCount={3} />);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useLogoutMutation).mockReturnValue({ mutate: logout } as unknown as ReturnType<
    typeof useLogoutMutation
  >);
  mockQueries(PROFILE, [ACCOUNT]);
  mockFriendsQuery({ data: { totalCount: 8 }, isPending: false });
});

describe("MyMenuSheet", () => {
  it("프로필·친구 수·마감된 펀딩 수·대표 계좌 은행을 보여준다", () => {
    renderSheet();

    expect(screen.getByText("지유")).toBeInTheDocument();
    expect(screen.getByText("생일 10월 13일")).toBeInTheDocument();
    expect(screen.getByText("8명")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /마감된 펀딩.*3개/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /대표 계좌.*토스뱅크/ })).toBeInTheDocument();
  });

  it("친구 목록을 불러오는 동안 친구 수 자리에 스켈레톤을 보여준다", () => {
    mockFriendsQuery({ isPending: true });
    renderSheet();

    expect(screen.getByRole("status", { name: "친구 수 불러오는 중" })).toBeInTheDocument();
    expect(screen.queryByText(/명$/)).not.toBeInTheDocument();
  });

  it("친구 목록 조회에 실패하면 친구 수를 0명으로 보여주지 않는다", () => {
    mockFriendsQuery({ isPending: false });
    renderSheet();

    expect(screen.getByText("친구")).toBeInTheDocument();
    expect(screen.queryByText(/명$/)).not.toBeInTheDocument();
    expect(screen.queryByRole("status", { name: "친구 수 불러오는 중" })).not.toBeInTheDocument();
  });

  it("생일이 없으면 생일 문구를 보여주지 않는다", () => {
    mockQueries({ ...PROFILE, birthday: null }, [ACCOUNT]);
    renderSheet();

    expect(screen.queryByText(/생일/)).not.toBeInTheDocument();
  });

  it("대표 계좌가 없으면 은행명을 비워둔다", () => {
    mockQueries(PROFILE, [{ ...ACCOUNT, isDefault: false }]);
    renderSheet();

    expect(screen.queryByText("토스뱅크")).not.toBeInTheDocument();
  });

  it("마감된 펀딩·대표 계좌 행을 누르면 각 시트를 연다", async () => {
    renderSheet();

    await userEvent.click(screen.getByText("마감된 펀딩"));
    expect(screen.getByText("마감된 펀딩 시트")).toBeInTheDocument();

    await userEvent.click(screen.getByText("대표 계좌"));
    expect(screen.getByText("대표 계좌 시트")).toBeInTheDocument();
  });

  it("프로필 행을 누르면 /my/profile로 이동한다", async () => {
    renderSheet();

    await userEvent.click(screen.getByRole("button", { name: /지유/ }));

    expect(push).toHaveBeenCalledWith("/my/profile");
  });

  it("친구 행을 누르면 슬라이드 진입을 켜고 /friends로 이동한다", async () => {
    useFriendsEntryStore.setState({ slideIn: false });
    renderSheet();

    await userEvent.click(screen.getByRole("button", { name: /친구.*8명/ }));

    expect(useFriendsEntryStore.getState().slideIn).toBe(true);
    expect(push).toHaveBeenCalledWith("/friends");
  });

  it("로그아웃에 성공하면 랜딩으로 이동한다", async () => {
    logout.mockImplementation((_, options) => options.onSuccess());
    renderSheet();

    await userEvent.click(screen.getByRole("button", { name: "로그아웃" }));

    expect(logout).toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("open이 false면 메뉴를 보여주지 않는다", () => {
    renderSheet(false);

    expect(screen.queryByText("내 프로필")).not.toBeInTheDocument();
  });
});
