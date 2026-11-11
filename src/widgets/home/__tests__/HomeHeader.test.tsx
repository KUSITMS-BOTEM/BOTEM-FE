import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import HomeHeader from "@/widgets/home/HomeHeader";

describe("HomeHeader", () => {
  it("'위시' 탭을 누르면 onSegmentChange를 'wish'로 호출한다", async () => {
    const onSegmentChange = vi.fn();
    render(<HomeHeader onSegmentChange={onSegmentChange} />);

    await userEvent.click(screen.getByRole("tab", { name: "위시" }));

    expect(onSegmentChange).toHaveBeenCalledWith("wish");
  });
});
