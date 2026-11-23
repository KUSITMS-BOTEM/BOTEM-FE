import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { FriendFundingResponse, FriendProfileResponse } from "@/types/friend/friend";
import GuestFriendProfileContainer from "@/widgets/friend/GuestFriendProfileContainer";

const push = vi.fn();
const replace = vi.fn();
const refetch = vi.fn();
const addFriendMutate = vi.fn();
const addFriendReset = vi.fn();
const useMyProfileQuery = vi.fn();
const useAddFriendMutation = vi.fn();
const mutate = vi.fn();
const handleKakaoLoginClick = vi.fn();
const useWishProfileQuery = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
}));
vi.mock("@/hooks/queries/user/useMyProfileQuery", () => ({
  useMyProfileQuery: (enabled?: boolean) => useMyProfileQuery(enabled),
}));
vi.mock("@/hooks/mutations/friend/useAddFriendMutation", () => ({
  useAddFriendMutation: () => useAddFriendMutation(),
}));
vi.mock("@/hooks/queries/wish-profile/useWishProfileQuery", () => ({
  useWishProfileQuery: (wishProfileKey: string) => useWishProfileQuery(wishProfileKey),
}));
vi.mock("@/hooks/mutations/auth/useKakaoLoginUriMutation", () => ({
  useKakaoLoginUriMutation: () => ({ mutate }),
}));
vi.mock("@/utils/auth/handleKakaoLoginClick", () => ({
  handleKakaoLoginClick: (fn: unknown, returnPath?: string) =>
    handleKakaoLoginClick(fn, returnPath),
}));

const funding: FriendFundingResponse = {
  fundingId: 1,
  shareKey: "share-key-1",
  type: "BIRTHDAY",
  productName: "소니 WH-1000 XM4",
  productImageUrl: null,
  deadline: "2026-10-13T23:59:59.999999",
  remainingDays: 7,
  participantCount: 2,
  firstParticipantName: "민지",
  confirmedPercentage: 50,
};

const profile = (overrides: Partial<FriendProfileResponse> = {}): FriendProfileResponse => ({
  userId: 5,
  name: "지유",
  profileImageUrl: null,
  birthday: "10-24",
  birthdayDday: 3,
  fundings: [funding],
  wishesVisible: false,
  wishCount: 2,
  wishes: [],
  ...overrides,
});

const mockQuery = (state: { data?: FriendProfileResponse | null; isPending?: boolean }) =>
  useWishProfileQuery.mockReturnValue({
    data: undefined,
    isPending: false,
    refetch,
    ...state,
  });

const mockMember = (wishProfileUrl: string, addFriend: { isIdle?: boolean; isError?: boolean }) => {
  useMyProfileQuery.mockReturnValue({ data: { wishProfileUrl }, isError: false });
  useAddFriendMutation.mockReturnValue({
    mutate: addFriendMutate,
    reset: addFriendReset,
    isIdle: true,
    isError: false,
    ...addFriend,
  });
};

describe("GuestFriendProfileContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMyProfileQuery.mockReturnValue({ data: undefined, isError: false });
    useAddFriendMutation.mockReturnValue({
      mutate: addFriendMutate,
      reset: addFriendReset,
      isIdle: true,
      isError: false,
    });
  });

  it("route의 wishProfileKey로 위시 프로필을 조회한다", () => {
    mockQuery({ data: profile() });
    render(<GuestFriendProfileContainer wishProfileKey="abc123" isLoggedIn={false} />);

    expect(useWishProfileQuery).toHaveBeenCalledWith("abc123");
  });

  it("불러오는 중이면 스켈레톤을 보여준다", () => {
    mockQuery({ isPending: true });
    render(<GuestFriendProfileContainer wishProfileKey="abc123" isLoggedIn={false} />);

    expect(screen.getByLabelText("친구 프로필 불러오는 중")).toBeInTheDocument();
  });

  it("불러오기에 실패하면 「다시 시도」로 다시 조회한다", async () => {
    mockQuery({ data: undefined });
    render(<GuestFriendProfileContainer wishProfileKey="abc123" isLoggedIn={false} />);

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("위시가 있으면 「카카오로 3초 만에 보기」를 보여주고 「나도 위시 만들기」는 숨긴다", () => {
    mockQuery({ data: profile({ wishCount: 2 }) });
    render(<GuestFriendProfileContainer wishProfileKey="abc123" isLoggedIn={false} />);

    expect(screen.getByRole("button", { name: /카카오로 3초 만에 보기/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /나도 위시 만들기/ })).not.toBeInTheDocument();
  });

  it("위시가 없으면 「카카오로 시작하기」와 「나도 위시 만들기」를 보여주고, 누르면 랜딩으로 이동한다", async () => {
    mockQuery({ data: profile({ wishCount: 0 }) });
    render(<GuestFriendProfileContainer wishProfileKey="abc123" isLoggedIn={false} />);

    expect(screen.getByRole("button", { name: /카카오로 시작하기/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /나도 위시 만들기/ }));

    expect(push).toHaveBeenCalledWith("/");
  });

  it("펀딩이 있으면 로그인 없이 보탤 수 있다는 안내를 보여준다", () => {
    mockQuery({ data: profile() });
    render(<GuestFriendProfileContainer wishProfileKey="abc123" isLoggedIn={false} />);

    expect(screen.getByText("로그인 없이 바로 보탤 수 있어요")).toBeInTheDocument();
  });

  it("펀딩이 없으면 펀딩 섹션을 보여주지 않는다", () => {
    mockQuery({ data: profile({ fundings: [] }) });
    render(<GuestFriendProfileContainer wishProfileKey="abc123" isLoggedIn={false} />);

    expect(screen.queryByRole("heading", { name: /진행중인 펀딩/ })).not.toBeInTheDocument();
    expect(screen.queryByText("로그인 없이 바로 보탤 수 있어요")).not.toBeInTheDocument();
  });

  it("카카오 버튼을 누르면 로그인 후 이 위시 프로필 링크로 돌아오도록 카카오 로그인을 시작한다", async () => {
    mockQuery({ data: profile() });
    render(<GuestFriendProfileContainer wishProfileKey="abc123" isLoggedIn={false} />);

    await userEvent.click(screen.getByRole("button", { name: /카카오로 3초 만에 보기/ }));

    expect(handleKakaoLoginClick).toHaveBeenCalledWith(mutate, "/share/profile/abc123");
  });

  it("비로그인이면 내 프로필을 조회하지 않고 친구 맺기도 보내지 않는다", () => {
    mockQuery({ data: profile() });
    render(<GuestFriendProfileContainer wishProfileKey="abc123" isLoggedIn={false} />);

    expect(useMyProfileQuery).toHaveBeenCalledWith(false);
    expect(addFriendMutate).not.toHaveBeenCalled();
  });

  it("로그인 방문자는 바로 친구를 맺고, 성공하면 친구 프로필로 이동한다", () => {
    mockQuery({ data: profile() });
    mockMember("https://botem.me/@other", {});
    render(<GuestFriendProfileContainer wishProfileKey="abc123" isLoggedIn />);

    expect(screen.getByLabelText("친구 프로필 불러오는 중")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /카카오/ })).not.toBeInTheDocument();
    expect(addFriendMutate).toHaveBeenCalledWith("abc123", expect.any(Object));

    addFriendMutate.mock.calls[0][1].onSuccess();
    expect(replace).toHaveBeenCalledWith("/friends/5");
  });

  it("로그인 방문자가 내 위시 프로필 링크를 열면 친구 맺기 없이 내 프로필로 이동한다", () => {
    mockQuery({ data: profile() });
    mockMember("https://botem.me/@abc123", {});
    render(<GuestFriendProfileContainer wishProfileKey="abc123" isLoggedIn />);

    expect(replace).toHaveBeenCalledWith("/my/profile");
    expect(addFriendMutate).not.toHaveBeenCalled();
  });

  it("친구 맺기에 실패하면 「다시 시도」로 친구 맺기를 다시 시도한다", async () => {
    mockQuery({ data: profile() });
    mockMember("https://botem.me/@other", { isIdle: false, isError: true });
    render(<GuestFriendProfileContainer wishProfileKey="abc123" isLoggedIn />);

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(addFriendReset).toHaveBeenCalledTimes(1);
    expect(refetch).not.toHaveBeenCalled();
  });
});
