import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { FriendFundingResponse, FriendProfileResponse } from "@/types/friend/friend";
import GuestFriendProfileContainer from "@/widgets/friend/GuestFriendProfileContainer";

const push = vi.fn();
const refetch = vi.fn();
const mutate = vi.fn();
const handleKakaoLoginClick = vi.fn();
const useWishProfileQuery = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
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
  type: "BIRTHDAY",
  productName: "소니 WH-1000 XM4",
  productImageUrl: null,
  deadline: "2026-10-13",
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

describe("GuestFriendProfileContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("route의 wishProfileKey로 위시 프로필을 조회한다", () => {
    mockQuery({ data: profile() });
    render(<GuestFriendProfileContainer wishProfileKey="abc123" />);

    expect(useWishProfileQuery).toHaveBeenCalledWith("abc123");
  });

  it("불러오는 중이면 스켈레톤을 보여준다", () => {
    mockQuery({ isPending: true });
    render(<GuestFriendProfileContainer wishProfileKey="abc123" />);

    expect(screen.getByLabelText("친구 프로필 불러오는 중")).toBeInTheDocument();
  });

  it("불러오기에 실패하면 「다시 시도」로 다시 조회한다", async () => {
    mockQuery({ data: undefined });
    render(<GuestFriendProfileContainer wishProfileKey="abc123" />);

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("위시가 있으면 「카카오로 3초 만에 보기」를 보여주고 「나도 위시 만들기」는 숨긴다", () => {
    mockQuery({ data: profile({ wishCount: 2 }) });
    render(<GuestFriendProfileContainer wishProfileKey="abc123" />);

    expect(screen.getByRole("button", { name: /카카오로 3초 만에 보기/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /나도 위시 만들기/ })).not.toBeInTheDocument();
  });

  it("위시가 없으면 「카카오로 시작하기」와 「나도 위시 만들기」를 보여주고, 누르면 랜딩으로 이동한다", async () => {
    mockQuery({ data: profile({ wishCount: 0 }) });
    render(<GuestFriendProfileContainer wishProfileKey="abc123" />);

    expect(screen.getByRole("button", { name: /카카오로 시작하기/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /나도 위시 만들기/ }));

    expect(push).toHaveBeenCalledWith("/");
  });

  it("펀딩이 있으면 로그인 없이 보탤 수 있다는 안내를 보여준다", () => {
    mockQuery({ data: profile() });
    render(<GuestFriendProfileContainer wishProfileKey="abc123" />);

    expect(screen.getByText("로그인 없이 바로 보탤 수 있어요")).toBeInTheDocument();
  });

  it("펀딩이 없으면 펀딩 섹션을 보여주지 않는다", () => {
    mockQuery({ data: profile({ fundings: [] }) });
    render(<GuestFriendProfileContainer wishProfileKey="abc123" />);

    expect(screen.queryByRole("heading", { name: /진행중인 펀딩/ })).not.toBeInTheDocument();
    expect(screen.queryByText("로그인 없이 바로 보탤 수 있어요")).not.toBeInTheDocument();
  });

  it("카카오 버튼을 누르면 로그인 후 이 친구 프로필로 돌아오도록 카카오 로그인을 시작한다", async () => {
    mockQuery({ data: profile() });
    render(<GuestFriendProfileContainer wishProfileKey="abc123" />);

    await userEvent.click(screen.getByRole("button", { name: /카카오로 3초 만에 보기/ }));

    expect(handleKakaoLoginClick).toHaveBeenCalledWith(mutate, "/friends/5");
  });
});
