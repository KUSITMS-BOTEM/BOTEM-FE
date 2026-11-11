import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import HomeHeader from "@/widgets/home/HomeHeader";

describe("HomeHeader", () => {
  it("'위시' 탭을 누르면 onSegmentChange를 'wish'로 호출한다", async () => {
    const onSegmentChange = vi.fn();
    render(<HomeHeader onSegmentChange={onSegmentChange} onMenuClick={vi.fn()} />);

    await userEvent.click(screen.getByRole("tab", { name: "위시" }));

    expect(onSegmentChange).toHaveBeenCalledWith("wish");
  });

  it("메뉴 버튼을 누르면 onMenuClick을 호출한다", async () => {
    const onMenuClick = vi.fn();
    render(<HomeHeader onSegmentChange={vi.fn()} onMenuClick={onMenuClick} />);

    await userEvent.click(screen.getByRole("button", { name: "메뉴 열기" }));

    expect(onMenuClick).toHaveBeenCalled();
  });
});
