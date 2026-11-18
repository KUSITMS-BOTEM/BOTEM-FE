import { render, screen } from "@testing-library/react";

import FriendsSkeleton from "@/widgets/friend/skeleton/FriendsSkeleton";

describe("FriendsSkeleton", () => {
  it("불러오는 중인 영역(aria-busy)으로 노출된다", () => {
    render(<FriendsSkeleton />);

    expect(screen.getByLabelText("친구 목록 불러오는 중")).toHaveAttribute("aria-busy", "true");
  });
});
