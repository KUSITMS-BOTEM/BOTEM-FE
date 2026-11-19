import { render } from "@testing-library/react";

import FundingResultCelebration from "@/widgets/funding/FundingResultCelebration";

vi.mock("@/widgets/funding/FundingResultWishPhoto", () => ({
  default: ({ sliceCount }: { sliceCount: number }) => (
    <div data-testid="wish-photo" data-slices={sliceCount} />
  ),
}));
vi.mock("@/widgets/funding/FundingResultConfettiPiece", () => ({
  default: () => <div data-testid="confetti" />,
}));
vi.mock("@/widgets/funding/FundingResultFriendDot", () => ({
  default: ({ count }: { count: number }) => <div data-testid="friend" data-count={count} />,
}));

const contributors = (count: number) =>
  Array.from({ length: count }, (_, index) => ({ userId: index + 1 }));

describe("FundingResultCelebration", () => {
  it("장식 요소라 스크린리더에서 숨긴다", () => {
    const { container } = render(
      <FundingResultCelebration contributors={contributors(3)} reduceMotion={false} />,
    );

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it.each([1, 2, 3, 8])("친구 %i명이면 친구 점과 사진 조각도 그 수만큼이다", count => {
    const { getAllByTestId, getByTestId } = render(
      <FundingResultCelebration contributors={contributors(count)} reduceMotion={false} />,
    );

    expect(getAllByTestId("friend")).toHaveLength(count);
    expect(getAllByTestId("friend")[0]).toHaveAttribute("data-count", String(count));
    expect(getByTestId("wish-photo")).toHaveAttribute("data-slices", String(count));
    expect(getAllByTestId("confetti")).toHaveLength(40);
  });

  it("8명이 넘으면 앞의 8명만 날아와 8조각으로 나눈다", () => {
    const { getAllByTestId, getByTestId } = render(
      <FundingResultCelebration contributors={contributors(12)} reduceMotion={false} />,
    );

    expect(getAllByTestId("friend")).toHaveLength(8);
    expect(getByTestId("wish-photo")).toHaveAttribute("data-slices", "8");
  });

  it("모션 감소 설정이면 컨페티와 친구 점 없이 위시 사진만 그린다", () => {
    const { queryAllByTestId, getByTestId } = render(
      <FundingResultCelebration contributors={contributors(3)} reduceMotion />,
    );

    expect(queryAllByTestId("confetti")).toHaveLength(0);
    expect(queryAllByTestId("friend")).toHaveLength(0);
    expect(getByTestId("wish-photo")).toBeInTheDocument();
  });
});
