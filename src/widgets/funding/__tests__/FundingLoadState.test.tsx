import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FundingLoadState from "@/widgets/funding/FundingLoadState";

const renderState = (isLoading: boolean) => {
  const onRetry = vi.fn();
  render(
    <FundingLoadState
      isLoading={isLoading}
      loadingLabel="선물을 불러오는 중이에요"
      errorMessage="선물 정보를 불러오지 못했어요"
      onRetry={onRetry}
    />,
  );
  return { onRetry };
};

describe("FundingLoadState", () => {
  it("불러오는 중이면 로딩 상태를 알리고 에러 안내는 보여주지 않는다", () => {
    renderState(true);

    expect(screen.getByRole("status")).toHaveTextContent("선물을 불러오는 중이에요");
    expect(screen.queryByText("선물 정보를 불러오지 못했어요")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
  });

  it("불러오지 못했으면 에러 안내와 다시 시도 버튼을 보여주고 로딩 상태는 없다", () => {
    renderState(false);

    expect(screen.getByText("선물 정보를 불러오지 못했어요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("다시 시도를 누르면 onRetry를 한 번 호출한다", async () => {
    const { onRetry } = renderState(false);

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
