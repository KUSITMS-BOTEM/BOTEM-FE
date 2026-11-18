import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { FriendFundingResponse, GuestFriendProfileResponse } from "@/types/friend/friend";
import GuestFriendProfileContainer from "@/widgets/friend/GuestFriendProfileContainer";

const push = vi.fn();
const refetch = vi.fn();
const mutate = vi.fn();
const handleKakaoLoginClick = vi.fn();
const useGuestFriendProfileQuery = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));
vi.mock("@/hooks/queries/friend/useGuestFriendProfileQuery", () => ({
  useGuestFriendProfileQuery: (userId: string) => useGuestFriendProfileQuery(userId),
}));
vi.mock("@/hooks/mutations/auth/useKakaoLoginUriMutation", () => ({
  useKakaoLoginUriMutation: () => ({ mutate }),
}));
vi.mock("@/utils/auth/handleKakaoLoginClick", () => ({
  handleKakaoLoginClick: (fn: unknown) => handleKakaoLoginClick(fn),
}));

const funding: FriendFundingResponse = {
  fundingId: 1,
  isSurprise: false,
  title: "지유의 생일 펀딩",
  productName: "소니 WH-1000 XM4",
  productImageUrl: null,
  deadline: "2026-10-13",
  currentAmount: 50,
  targetAmount: 100,
  representativeParticipantName: "민지",
  participantCount: 2,
};

const profile = (
  overrides: Partial<GuestFriendProfileResponse> = {},
): GuestFriendProfileResponse => ({
  userId: 5,
  name: "지유",
  profileImageUrl: null,
  birthday: "10-24",
  birthdayDday: 3,
  fundings: [funding],
  wishCount: 2,
  ...overrides,
});

const mockQuery = (state: { data?: GuestFriendProfileResponse | null; isPending?: boolean }) =>
  useGuestFriendProfileQuery.mockReturnValue({
    data: undefined,
    isPending: false,
    refetch,
    ...state,
  });

describe("GuestFriendProfileContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("route의 userId로 공개 프로필을 조회한다", () => {
    mockQuery({ data: profile() });
    render(<GuestFriendProfileContainer userId="5" />);

    expect(useGuestFriendProfileQuery).toHaveBeenCalledWith("5");
  });

  it("불러오는 중이면 스켈레톤을 보여준다", () => {
    mockQuery({ isPending: true });
    render(<GuestFriendProfileContainer userId="5" />);

    expect(screen.getByLabelText("친구 프로필 불러오는 중")).toBeInTheDocument();
  });

  it("불러오기에 실패하면 「다시 시도」로 다시 조회한다", async () => {
    mockQuery({ data: undefined });
    render(<GuestFriendProfileContainer userId="5" />);

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("위시가 있으면 「카카오로 3초 만에 보기」를 보여주고 「나도 위시 만들기」는 숨긴다", () => {
    mockQuery({ data: profile({ wishCount: 2 }) });
    render(<GuestFriendProfileContainer userId="5" />);

    expect(screen.getByRole("button", { name: /카카오로 3초 만에 보기/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /나도 위시 만들기/ })).not.toBeInTheDocument();
  });

  it("위시가 없으면 「카카오로 시작하기」와 「나도 위시 만들기」를 보여주고, 누르면 랜딩으로 이동한다", async () => {
    mockQuery({ data: profile({ wishCount: 0 }) });
    render(<GuestFriendProfileContainer userId="5" />);

    expect(screen.getByRole("button", { name: /카카오로 시작하기/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /나도 위시 만들기/ }));

    expect(push).toHaveBeenCalledWith("/");
  });

  it("펀딩이 있으면 로그인 없이 보탤 수 있다는 안내를 보여준다", () => {
    mockQuery({ data: profile() });
    render(<GuestFriendProfileContainer userId="5" />);

    expect(screen.getByText("로그인 없이 바로 보탤 수 있어요")).toBeInTheDocument();
  });

  it("펀딩이 없으면 펀딩 섹션을 보여주지 않는다", () => {
    mockQuery({ data: profile({ fundings: [] }) });
    render(<GuestFriendProfileContainer userId="5" />);

    expect(screen.queryByRole("heading", { name: /진행중인 펀딩/ })).not.toBeInTheDocument();
    expect(screen.queryByText("로그인 없이 바로 보탤 수 있어요")).not.toBeInTheDocument();
  });

  it("카카오 버튼을 누르면 카카오 로그인을 시작한다", async () => {
    mockQuery({ data: profile() });
    render(<GuestFriendProfileContainer userId="5" />);

    await userEvent.click(screen.getByRole("button", { name: /카카오로 3초 만에 보기/ }));

    expect(handleKakaoLoginClick).toHaveBeenCalledWith(mutate);
  });
});
