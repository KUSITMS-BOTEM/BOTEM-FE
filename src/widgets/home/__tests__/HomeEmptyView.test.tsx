import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import HomeEmptyView from "@/widgets/home/HomeEmptyView";

describe("HomeEmptyView", () => {
  it("빈 홈 제목을 보여주고 '위시 추가하기'를 누르면 onAddWish를 호출한다", async () => {
    const onAddWish = vi.fn();
    render(<HomeEmptyView onAddWish={onAddWish} />);

    await userEvent.click(screen.getByRole("button", { name: "위시 추가하기" }));

    expect(screen.getByText("갖고 싶은걸 먼저 담아볼까요?")).toBeInTheDocument();
    expect(onAddWish).toHaveBeenCalledTimes(1);
  });
});
