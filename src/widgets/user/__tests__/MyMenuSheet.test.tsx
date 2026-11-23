import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { showGlobalErrorDialog } from "@/lib/queryClient";
import { useLogoutMutation } from "@/hooks/mutations/auth/useLogoutMutation";
import { useClosedFundingsQuery } from "@/hooks/queries/funding/useClosedFundingsQuery";
import { useFriendsQuery } from "@/hooks/queries/friend/useFriendsQuery";
import { usePayoutAccountsQuery } from "@/hooks/queries/payout-account/usePayoutAccountsQuery";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import type { PayoutAccountResponse } from "@/types/payout-account/payoutAccount";
import type { MyProfile } from "@/types/user/profile";
import MyMenuSheet from "@/widgets/user/MyMenuSheet";

const replace = vi.fn();
const push = vi.fn();
const logout = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, push }) }));
vi.mock("@/lib/queryClient", () => ({ showGlobalErrorDialog: vi.fn() }));
vi.mock("@/hooks/mutations/auth/useLogoutMutation");
vi.mock("@/hooks/queries/funding/useClosedFundingsQuery");
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

const SUCCESS = { isSuccess: true, isError: false, isFetching: false };
const PENDING = { isSuccess: false, isError: false, isFetching: true };
const FAILED = {
  isSuccess: false,
  isError: true,
  isFetching: false,
  error: new Error("서버 오류"),
};

const mockProfile = (profile: MyProfile) => {
  vi.mocked(useMyProfileQuery).mockReturnValue({ data: profile } as unknown as ReturnType<
    typeof useMyProfileQuery
  >);
};

const mockAccounts = (state: object) => {
  vi.mocked(usePayoutAccountsQuery).mockReturnValue(
    state as unknown as ReturnType<typeof usePayoutAccountsQuery>,
  );
};

const mockFriends = (state: object) => {
  vi.mocked(useFriendsQuery).mockReturnValue(
    state as unknown as ReturnType<typeof useFriendsQuery>,
  );
};

const mockClosedFundings = (state: object) => {
  vi.mocked(useClosedFundingsQuery).mockReturnValue(
    state as unknown as ReturnType<typeof useClosedFundingsQuery>,
  );
};

const mockAllSuccess = (accounts: PayoutAccountResponse[] = [ACCOUNT]) => {
  mockAccounts({ ...SUCCESS, data: accounts });
  mockFriends({ ...SUCCESS, data: { totalCount: 8 } });
  mockClosedFundings({ ...SUCCESS, data: { tabCounts: { all: 3 }, years: [] } });
};

const renderSheet = (open = true) => render(<MyMenuSheet open={open} onClose={vi.fn()} />);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useLogoutMutation).mockReturnValue({ mutate: logout } as unknown as ReturnType<
    typeof useLogoutMutation
  >);
  mockProfile(PROFILE);
  mockAllSuccess();
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

  it("열려 있을 때만 세 목록을 조회한다", () => {
    renderSheet(false);

    expect(useClosedFundingsQuery).toHaveBeenCalledWith(false);
    expect(useFriendsQuery).toHaveBeenCalledWith(false);
    expect(usePayoutAccountsQuery).toHaveBeenCalledWith(false);
  });

  it.each([
    ["마감된 펀딩", () => mockClosedFundings(PENDING)],
    ["친구", () => mockFriends(PENDING)],
    ["대표 계좌", () => mockAccounts(PENDING)],
  ])("%s 목록을 불러오는 동안 스켈레톤을 보여주고 본문은 숨긴다", (_, makePending) => {
    makePending();
    renderSheet();

    expect(screen.getByRole("status", { name: "메뉴 불러오는 중" })).toBeInTheDocument();
    expect(screen.queryByText("내 프로필")).not.toBeInTheDocument();
    expect(showGlobalErrorDialog).not.toHaveBeenCalled();
  });

  it.each([
    ["마감된 펀딩", () => mockClosedFundings(FAILED)],
    ["친구", () => mockFriends(FAILED)],
    ["대표 계좌", () => mockAccounts(FAILED)],
  ])("%s 조회가 실패하면 스켈레톤을 유지하고 에러 다이얼로그를 띄운다", (_, makeFailed) => {
    makeFailed();
    renderSheet();

    expect(screen.getByRole("status", { name: "메뉴 불러오는 중" })).toBeInTheDocument();
    expect(screen.queryByText("내 프로필")).not.toBeInTheDocument();
    expect(showGlobalErrorDialog).toHaveBeenCalledWith(FAILED.error);
  });

  it("재조회 중인 error는 재시도가 끝나기 전까지 다이얼로그를 띄우지 않는다", () => {
    mockClosedFundings({ ...FAILED, isFetching: true });
    renderSheet();

    expect(showGlobalErrorDialog).not.toHaveBeenCalled();
  });

  it("여러 조회가 실패해도 다이얼로그는 한 번만 띄우고 리렌더에도 반복하지 않는다", () => {
    mockClosedFundings(FAILED);
    mockFriends(FAILED);
    const { rerender } = renderSheet();
    rerender(<MyMenuSheet open onClose={vi.fn()} />);

    expect(showGlobalErrorDialog).toHaveBeenCalledTimes(1);
  });

  it("메뉴를 닫았다 다시 열었을 때 여전히 실패 상태면 다시 한 번 띄운다", () => {
    mockClosedFundings(FAILED);
    const { rerender } = renderSheet();
    rerender(<MyMenuSheet open={false} onClose={vi.fn()} />);
    rerender(<MyMenuSheet open onClose={vi.fn()} />);

    expect(showGlobalErrorDialog).toHaveBeenCalledTimes(2);
  });

  it("스켈레톤이 보이는 동안에도 로그아웃할 수 있다", async () => {
    mockClosedFundings(FAILED);
    logout.mockImplementation((_, options) => options.onSuccess());
    renderSheet();

    await userEvent.click(screen.getByRole("button", { name: "로그아웃" }));

    expect(replace).toHaveBeenCalledWith("/");
  });

  it("생일이 없으면 생일 문구를 보여주지 않는다", () => {
    mockProfile({ ...PROFILE, birthday: null });
    renderSheet();

    expect(screen.queryByText(/생일/)).not.toBeInTheDocument();
  });

  it("대표 계좌가 없으면 은행명을 비워둔다", () => {
    mockAllSuccess([{ ...ACCOUNT, isDefault: false }]);
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
