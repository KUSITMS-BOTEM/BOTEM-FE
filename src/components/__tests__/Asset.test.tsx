import { render, screen } from "@testing-library/react";

import Asset from "@/components/Asset";

describe("Asset", () => {
  it("icon prop으로 전달한 요소가 그대로 렌더된다", () => {
    render(<Asset icon={<svg data-testid="icon" />} />);

    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("size를 생략하면 기본값 xsmall이 적용되어 size-4 클래스가 붙는다", () => {
    render(<Asset icon={<svg data-testid="icon" />} />);
    const wrapper = screen.getByTestId("icon").closest("span");

    expect(wrapper?.className).toContain("size-4");
  });

  it.each([
    ["small", "size-5"],
    ["medium", "size-6"],
    ["large", "size-7"],
  ] as const)('size="%s"면 %s 클래스가 적용된다', (size, sizeClass) => {
    render(<Asset size={size} icon={<svg data-testid="icon" />} />);
    const wrapper = screen.getByTestId("icon").closest("span");

    expect(wrapper?.className).toContain(sizeClass);
  });

  it("className prop이 전달되면 베이스 클래스와 함께 병합되어 적용된다", () => {
    render(<Asset icon={<svg data-testid="icon" />} className="mt-4" />);
    const wrapper = screen.getByTestId("icon").closest("span");

    expect(wrapper?.className).toContain("mt-4");
    expect(wrapper?.className).toContain("inline-flex");
  });

  it("icon으로 svg가 아닌 일반 엘리먼트를 전달해도 그대로 렌더된다", () => {
    render(<Asset icon={<span data-testid="icon">텍스트</span>} />);

    expect(screen.getByTestId("icon")).toHaveTextContent("텍스트");
  });
});
