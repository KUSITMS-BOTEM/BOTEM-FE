import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ErrorView from "@/components/ErrorView";

const renderErrorView = () => {
  const onRetry = vi.fn();
  const onClose = vi.fn();
  render(<ErrorView onRetry={onRetry} onClose={onClose} />);
  return { onRetry, onClose };
};

describe("ErrorView", () => {
  it("제목과 안내 문구가 노출된다", () => {
    renderErrorView();

    expect(screen.getByRole("heading", { level: 1, name: "잠시 문제가 생겼어요" })).toBeVisible();
    expect(screen.getByText(/요청을 마치지 못했어요/)).toBeVisible();
  });

  it("'다시 시도'를 누르면 onRetry만 호출된다", async () => {
    const { onRetry, onClose } = renderErrorView();

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("'닫기'를 누르면 onClose만 호출된다", async () => {
    const { onRetry, onClose } = renderErrorView();

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onRetry).not.toHaveBeenCalled();
  });
});
