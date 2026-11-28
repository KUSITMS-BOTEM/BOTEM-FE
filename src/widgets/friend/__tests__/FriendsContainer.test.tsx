import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useFriendsEntryStore } from "@/store/friendsEntryStore";
import FriendsContainer from "@/widgets/friend/FriendsContainer";
import type { FriendListResponse, FriendResponse } from "@/types/friend/friend";

const back = vi.fn();
const useFriendsQuery = vi.fn();
const useMyProfileQuery = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back }),
}));
vi.mock("@/hooks/queries/friend/useFriendsQuery", () => ({
  useFriendsQuery: () => useFriendsQuery(),
}));
vi.mock("@/hooks/queries/user/useMyProfileQuery", () => ({
  useMyProfileQuery: () => useMyProfileQuery(),
}));

const friend = (userId: number, name: string, birthdayDday: number | null): FriendResponse => ({
  userId,
  name,
  profileImageUrl: null,
  birthday: birthdayDday === null ? null : "12-01",
  birthdayDday,
  wishCount: 1,
  fundingInProgress: false,
  surpriseFundingInProgress: false,
});

const WISH_PROFILE_URL = "https://botem.me/@wish-key";

const mockData = (data: FriendListResponse) => useFriendsQuery.mockReturnValue({ data });

describe("FriendsContainer", () => {
  beforeEach(() => {
    back.mockClear();
    useMyProfileQuery.mockReturnValue({ data: { wishProfileUrl: WISH_PROFILE_URL } });
  });

  afterEach(() => {
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
  });

  it("초대링크 전송을 누르면 내 위시 프로필 링크로 기기 공유창을 연다", async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { value: shareMock, configurable: true });
    mockData({ totalCount: 0, upcomingBirthdayFriends: [], friends: [] });
    render(<FriendsContainer />);

    await userEvent.setup().click(screen.getByRole("button", { name: "초대링크 전송" }));

    expect(shareMock).toHaveBeenCalledWith({
      title: "보탬에 친구와 함께해요!",
      url: WISH_PROFILE_URL,
    });
  });

  it("공유창을 지원하지 않으면 링크를 복사하고 토스트를 보여준다", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    mockData({ totalCount: 0, upcomingBirthdayFriends: [], friends: [] });
    render(<FriendsContainer />);

    await user.click(screen.getByRole("button", { name: "초대링크 전송" }));

    expect(writeText).toHaveBeenCalledWith(WISH_PROFILE_URL);
    expect(await screen.findByText("초대 링크를 복사했어요")).toBeInTheDocument();
  });

  it("프로필 링크가 아직 없으면 초대링크 전송 버튼을 비활성화한다", () => {
    useMyProfileQuery.mockReturnValue({ data: undefined });
    mockData({ totalCount: 0, upcomingBirthdayFriends: [], friends: [] });
    render(<FriendsContainer />);

    expect(screen.getByRole("button", { name: "초대링크 전송" })).toBeDisabled();
  });

  it("뒤로가기 버튼을 클릭하면 router.back을 호출한다", async () => {
    mockData({ totalCount: 0, upcomingBirthdayFriends: [], friends: [] });
    render(<FriendsContainer />);

    await userEvent.setup().click(screen.getByRole("button", { name: "뒤로가기" }));

    await waitFor(() => expect(back).toHaveBeenCalledTimes(1));
  });

  it("마이 메뉴에서 들어오면 진입 후 슬라이드 표시를 꺼, 뒤로 돌아올 땐 다시 슬라이드되지 않는다", () => {
    useFriendsEntryStore.setState({ slideIn: true });
    mockData({ totalCount: 0, upcomingBirthdayFriends: [], friends: [] });
    render(<FriendsContainer />);

    expect(useFriendsEntryStore.getState().slideIn).toBe(false);
  });

  it("불러오는 중이면 친구 목록 스켈레톤을 보여준다", () => {
    useFriendsQuery.mockReturnValue({ data: undefined, isPending: true });
    render(<FriendsContainer />);

    expect(screen.getByLabelText("친구 목록 불러오는 중")).toBeInTheDocument();
  });

  it("펀딩 상태에 따라 「펀딩 중」·「서프라이즈 펀딩중」 배지를 보여준다", () => {
    const a = { ...friend(1, "가", 3), fundingInProgress: true };
    const b = { ...friend(2, "나", 5), surpriseFundingInProgress: true };
    mockData({ totalCount: 2, upcomingBirthdayFriends: [a, b], friends: [a, b] });
    render(<FriendsContainer />);

    expect(screen.getByText("펀딩 중")).toBeInTheDocument();
    expect(screen.getByText("서프라이즈 펀딩중")).toBeInTheDocument();
  });

  it("둘 다 진행 중이면 「서프라이즈 펀딩중」 배지 하나만 보여준다", () => {
    const a = { ...friend(1, "가", 3), fundingInProgress: true, surpriseFundingInProgress: true };
    mockData({ totalCount: 1, upcomingBirthdayFriends: [a], friends: [a] });
    render(<FriendsContainer />);

    expect(screen.getByText("서프라이즈 펀딩중")).toBeInTheDocument();
    expect(screen.queryByText("펀딩 중")).not.toBeInTheDocument();
  });

  it("진행 중인 펀딩이 없으면 배지를 보여주지 않는다", () => {
    const a = friend(1, "가", 3);
    const b = friend(2, "나", null);
    mockData({ totalCount: 2, upcomingBirthdayFriends: [a], friends: [a, b] });
    render(<FriendsContainer />);

    expect(screen.queryByText("펀딩 중")).not.toBeInTheDocument();
    expect(screen.queryByText("서프라이즈 펀딩중")).not.toBeInTheDocument();
  });

  it("60일 이내 친구가 없으면 '곧 생일인 친구'와 전체보기를 숨긴다", () => {
    const a = friend(1, "가나", null);
    mockData({ totalCount: 1, upcomingBirthdayFriends: [], friends: [a] });
    render(<FriendsContainer />);

    expect(screen.queryByText("곧 생일인 친구")).not.toBeInTheDocument();
    expect(screen.getByText("전체 1명")).toBeInTheDocument();
    expect(screen.getByText("가나 · 위시 1개")).toBeInTheDocument();
  });

  it("2명 이하면 전체보기 버튼 없이 모두 보여준다", () => {
    const [a, b] = [friend(1, "가", 3), friend(2, "나", 5)];
    mockData({ totalCount: 2, upcomingBirthdayFriends: [a, b], friends: [a, b] });
    render(<FriendsContainer />);

    expect(screen.getByText("가 · 위시 1개")).toBeInTheDocument();
    expect(screen.getByText("나 · 위시 1개")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "전체보기" })).not.toBeInTheDocument();
  });

  it("3명 이상이면 2명만 보이고, 전체보기/접기로 펼치고 접는다", async () => {
    const ups = [friend(1, "가", 1), friend(2, "나", 2), friend(3, "다", 3)];
    mockData({ totalCount: 3, upcomingBirthdayFriends: ups, friends: ups });
    render(<FriendsContainer />);
    const user = userEvent.setup();

    expect(screen.queryByText("다 · 위시 1개")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "전체보기" }));
    expect(screen.getByText("다 · 위시 1개")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "접기" }));
    await waitFor(() => expect(screen.queryByText("다 · 위시 1개")).not.toBeInTheDocument());
  });

  it("곧 생일인 친구는 아래 일반 친구 목록에서 제외한다", () => {
    const up = friend(1, "가", 3);
    const other = friend(2, "나", null);
    mockData({ totalCount: 2, upcomingBirthdayFriends: [up], friends: [up, other] });
    render(<FriendsContainer />);

    expect(screen.getAllByText("가 · 위시 1개")).toHaveLength(1);
    expect(screen.getByText("나 · 위시 1개")).toBeInTheDocument();
  });

  it("친구 아이템을 누르면 해당 친구 프로필(/friends/{userId})로 이동하는 링크다", () => {
    const upcoming = friend(2, "민지", 3);
    const other = friend(6, "하린", null);
    mockData({ totalCount: 2, upcomingBirthdayFriends: [upcoming], friends: [upcoming, other] });
    render(<FriendsContainer />);

    expect(screen.getByRole("link", { name: /민지/ })).toHaveAttribute("href", "/friends/2");
    expect(screen.getByRole("link", { name: /하린/ })).toHaveAttribute("href", "/friends/6");
  });
});
