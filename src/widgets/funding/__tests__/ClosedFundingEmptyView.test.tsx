import { render, screen } from "@testing-library/react";

import ClosedFundingEmptyView from "@/widgets/funding/ClosedFundingEmptyView";

describe("ClosedFundingEmptyView", () => {
  it("제목을 보여준다", () => {
    render(<ClosedFundingEmptyView />);

    expect(screen.getByText("아직 끝난 펀딩이 없어요")).toBeInTheDocument();
  });

  it("안내 문구 두 줄을 보여준다", () => {
    render(<ClosedFundingEmptyView />);

    expect(
      screen.getByText(/펀딩이 마감되면 이곳에\s*추억과 롤링페이퍼가 차곡차곡 쌓여요/),
    ).toBeInTheDocument();
  });

  it("장식 일러스트는 접근성 트리에 노출하지 않는다", () => {
    const { container } = render(<ClosedFundingEmptyView />);

    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});
