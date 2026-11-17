import { render, screen } from "@testing-library/react";

import FriendProfileSkeleton from "@/widgets/friend/skeleton/FriendProfileSkeleton";

describe("FriendProfileSkeleton", () => {
  it("불러오는 중인 영역(aria-busy)으로 노출된다", () => {
    render(<FriendProfileSkeleton />);

    expect(screen.getByLabelText("친구 프로필 불러오는 중")).toHaveAttribute("aria-busy", "true");
  });
});
