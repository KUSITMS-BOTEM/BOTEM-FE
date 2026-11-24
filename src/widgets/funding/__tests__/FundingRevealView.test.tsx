import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FundingRevealView from "@/widgets/funding/FundingRevealView";

vi.mock("@/components/effects/RevealMotion", () => ({
  default: ({ names }: { names: string[] }) => (
    <div data-testid="reveal-motion">{names.join(",")}</div>
  ),
}));

const renderView = (props: Partial<React.ComponentProps<typeof FundingRevealView>> = {}) => {
  const onOpenMessages = props.onOpenMessages ?? vi.fn();
  render(
    <FundingRevealView
      contributorNames={["지유", "민준"]}
      participantCount={8}
      confirmedAmount={429000}
      achievementPercentage={100}
      isOpening={false}
      {...props}
      onOpenMessages={onOpenMessages}
    />,
  );
  return { onOpenMessages };
};

describe("FundingRevealView", () => {
  it("친구 이름을 날리고 참여 인원으로 제목을 만든다", () => {
    renderView();

    expect(screen.getByTestId("reveal-motion")).toHaveTextContent("지유,민준");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "친구 8명이 보탬을 보냈어요!",
    );
  });

  it("달성률이 100% 이상이면 금액 뒤에 '목표 달성'을 붙인다", () => {
    renderView({ achievementPercentage: 100 });

    expect(screen.getByText("429,000원이 모였어요 · 목표 달성")).toBeInTheDocument();
  });

  it("달성률이 100% 미만이면 금액만 보여준다", () => {
    renderView({ achievementPercentage: 99 });

    expect(screen.getByText("429,000원이 모였어요")).toBeInTheDocument();
    expect(screen.queryByText(/목표 달성/)).not.toBeInTheDocument();
  });

  it("'메시지 열어보기'를 누르면 onOpenMessages를 호출한다", async () => {
    const { onOpenMessages } = renderView();

    await userEvent.click(screen.getByRole("button", { name: "메시지 열어보기" }));

    expect(onOpenMessages).toHaveBeenCalledTimes(1);
  });

  it("여는 중이면 버튼이 로딩 상태로 막혀 onOpenMessages를 호출하지 않는다", async () => {
    const { onOpenMessages } = renderView({ isOpening: true });

    await userEvent.click(screen.getByRole("button", { name: "메시지 열어보기" }));

    expect(screen.getByRole("button", { name: "메시지 열어보기" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(onOpenMessages).not.toHaveBeenCalled();
  });
});
