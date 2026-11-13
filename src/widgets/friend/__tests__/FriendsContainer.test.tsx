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
});
