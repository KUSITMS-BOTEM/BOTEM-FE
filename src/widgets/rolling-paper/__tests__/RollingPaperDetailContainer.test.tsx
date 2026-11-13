import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RollingPaperDetailContainer from "@/widgets/rolling-paper/RollingPaperDetailContainer";

const backMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: backMock }),
}));

describe("RollingPaperDetailContainer", () => {
  it("뒤로 가기 버튼을 누르면 이전 페이지로 돌아간다", async () => {
    const user = userEvent.setup();
    render(<RollingPaperDetailContainer count={5} />);

    await user.click(screen.getByRole("button", { name: "뒤로 가기" }));

    expect(backMock).toHaveBeenCalledTimes(1);
  });

  it("편지지와 프로필 휠을 함께 그린다", () => {
    render(<RollingPaperDetailContainer count={5} />);

    expect(screen.getByTestId("rolling-paper-wheel")).toBeInTheDocument();
  });

  it("뒤로 가기 버튼은 페이드인을 위해 투명하게 시작한다", () => {
    render(<RollingPaperDetailContainer count={5} />);

    expect(screen.getByRole("button", { name: "뒤로 가기" }).parentElement).toHaveStyle({
      opacity: "0",
    });
  });
});
