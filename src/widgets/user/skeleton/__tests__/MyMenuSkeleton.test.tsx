import { render, screen } from "@testing-library/react";

import MyMenuSkeleton from "@/widgets/user/skeleton/MyMenuSkeleton";

describe("MyMenuSkeleton", () => {
  it("메뉴를 불러오는 중임을 상태 영역으로 알린다", () => {
    render(<MyMenuSkeleton />);

    expect(screen.getByRole("status", { name: "메뉴 불러오는 중" })).toBeInTheDocument();
  });
});
