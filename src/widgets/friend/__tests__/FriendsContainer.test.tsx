import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FriendsContainer from "@/widgets/friend/FriendsContainer";
import type { FriendListResponse, FriendResponse } from "@/types/friend/friend";

const back = vi.fn();
const useFriendsQuery = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back }),
}));
vi.mock("@/hooks/queries/friend/useFriendsQuery", () => ({
  useFriendsQuery: () => useFriendsQuery(),
}));

const friend = (userId: number, name: string, birthdayDday: number | null): FriendResponse => ({
  userId,
  name,
  profileImageUrl: null,
  birthday: birthdayDday === null ? null : "12-01",
  birthdayDday,
  wishCount: 1,
});

const mockData = (data: FriendListResponse) => useFriendsQuery.mockReturnValue({ data });

describe("FriendsContainer", () => {
  beforeEach(() => {
    back.mockClear();
  });

  it("뒤로가기 버튼을 클릭하면 router.back을 호출한다", async () => {
    mockData({ totalCount: 0, upcomingBirthdayFriends: [], friends: [] });
    render(<FriendsContainer />);

    await userEvent.setup().click(screen.getByRole("button", { name: "뒤로가기" }));

    expect(back).toHaveBeenCalledTimes(1);
  });

  it("불러오는 중이면 친구 목록 스켈레톤을 보여준다", () => {
    useFriendsQuery.mockReturnValue({ data: undefined, isPending: true });
    render(<FriendsContainer />);

    expect(screen.getByLabelText("친구 목록 불러오는 중")).toBeInTheDocument();
  });

  it("펀딩 상태에 따라 「펀딩 중」·「서프라이즈 펀딩중」 배지를 보여준다", () => {
    const a = { ...friend(1, "가", 3), fundingStatus: "FUNDING" as const };
    const b = { ...friend(2, "나", 5), fundingStatus: "SURPRISE_FUNDING" as const };
    mockData({ totalCount: 2, upcomingBirthdayFriends: [a, b], friends: [a, b] });
    render(<FriendsContainer />);

    expect(screen.getByText("펀딩 중")).toBeInTheDocument();
    expect(screen.getByText("서프라이즈 펀딩중")).toBeInTheDocument();
  });

  it("펀딩 상태가 없거나 NONE이면 배지를 보여주지 않는다", () => {
    const a = friend(1, "가", 3);
    const b = { ...friend(2, "나", null), fundingStatus: "NONE" as const };
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
    expect(screen.queryByText("다 · 위시 1개")).not.toBeInTheDocument();
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
