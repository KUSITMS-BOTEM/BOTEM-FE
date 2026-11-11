import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import HomeLoadError from "@/widgets/home/HomeLoadError";

describe("HomeLoadError", () => {
  it("전달한 메시지를 보여주고 '다시 시도'를 누르면 onRetry를 호출한다", async () => {
    const onRetry = vi.fn();
    render(<HomeLoadError message="홈 정보를 불러오지 못했어요" onRetry={onRetry} />);

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(screen.getByText("홈 정보를 불러오지 못했어요")).toBeInTheDocument();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
