import { render, screen } from "@testing-library/react";

import GuestFriendWishSection from "@/widgets/friend/GuestFriendWishSection";

describe("GuestFriendWishSection", () => {
  it("위시 개수만큼 잠긴 위시 항목과 「위시 N개」 제목을 보여준다", () => {
    render(<GuestFriendWishSection wishCount={3} />);

    expect(screen.getByRole("heading", { name: "위시 3개" })).toBeInTheDocument();
    expect(screen.getAllByText("로그인하면 볼 수 있어요")).toHaveLength(3);
  });

  it("위시가 0개면 잠긴 항목 대신 엠티뷰를 보여준다", () => {
    render(<GuestFriendWishSection wishCount={0} />);

    expect(screen.getByRole("heading", { name: "위시 0개" })).toBeInTheDocument();
    expect(screen.getByText(/아직 위시가 없어요/)).toBeInTheDocument();
    expect(screen.queryByText("로그인하면 볼 수 있어요")).not.toBeInTheDocument();
  });
});
