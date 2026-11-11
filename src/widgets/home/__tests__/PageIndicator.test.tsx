import { render, screen } from "@testing-library/react";

import PageIndicator from "@/widgets/home/PageIndicator";

describe("PageIndicator", () => {
  it("aria-label이 '{total}페이지 중 {current}페이지'다", () => {
    render(<PageIndicator total={5} current={2} />);

    expect(screen.getByRole("img", { name: "5페이지 중 2페이지" })).toBeInTheDocument();
  });

  it("total 개수만큼 점을 렌더한다", () => {
    render(<PageIndicator total={4} current={1} />);

    expect(screen.getByRole("img").children).toHaveLength(4);
  });

  it("current번째 점만 활성 스타일이다", () => {
    render(<PageIndicator total={3} current={2} />);

    const dots = Array.from(screen.getByRole("img").children);
    expect(dots.map(dot => dot.classList.contains("bg-base-gray-800"))).toEqual([
      false,
      true,
      false,
    ]);
  });

  it("total이 0이면 점이 없다", () => {
    render(<PageIndicator total={0} current={0} />);

    expect(screen.getByRole("img").children).toHaveLength(0);
  });
});
