import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FriendsContainer from "@/widgets/friend/FriendsContainer";

const back = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back }),
}));

describe("FriendsContainer", () => {
  beforeEach(() => {
    back.mockClear();
  });

  it("뒤로가기 버튼을 클릭하면 router.back을 호출한다", async () => {
    const user = userEvent.setup();
    render(<FriendsContainer />);

    await user.click(screen.getByRole("button", { name: "뒤로가기" }));

    expect(back).toHaveBeenCalledTimes(1);
  });

  it("곧 생일인 친구 목록에 민지·서준을 표시한다", () => {
    render(<FriendsContainer />);

    expect(screen.getByText("민지 · 위시 3개")).toBeInTheDocument();
    expect(screen.getByText("서준 · 위시 6개")).toBeInTheDocument();
  });

  it("일반 친구 목록에 하린·예준·서준을 표시한다", () => {
    render(<FriendsContainer />);

    expect(screen.getByText("하린 · 위시 4개")).toBeInTheDocument();
    expect(screen.getByText("예준 · 위시 0개")).toBeInTheDocument();
    expect(screen.getByText("서준 · 위시 42개")).toBeInTheDocument();
  });

  it("초대링크 전송·전체보기 버튼이 있다", () => {
    render(<FriendsContainer />);

    expect(screen.getByRole("button", { name: "초대링크 전송" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "전체보기" })).toBeInTheDocument();
  });
});
