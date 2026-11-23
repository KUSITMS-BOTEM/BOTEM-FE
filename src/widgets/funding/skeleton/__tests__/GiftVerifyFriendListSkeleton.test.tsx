import { render, screen } from "@testing-library/react";

import GiftVerifyFriendListSkeleton from "@/widgets/funding/skeleton/GiftVerifyFriendListSkeleton";

describe("GiftVerifyFriendListSkeleton", () => {
  it("함께한 친구를 불러오는 중인 상태 영역으로 노출된다", () => {
    render(<GiftVerifyFriendListSkeleton />);

    expect(screen.getByRole("status", { name: "함께한 친구를 불러오는 중" })).toBeInTheDocument();
  });
});
