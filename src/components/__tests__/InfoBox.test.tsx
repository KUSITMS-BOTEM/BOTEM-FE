import { render, screen } from "@testing-library/react";

import InfoBox from "@/components/InfoBox";

describe("InfoBox", () => {
  it("text prop 문구를 표시한다", () => {
    render(<InfoBox text="안내 문구" />);

    expect(screen.getByText("안내 문구")).toBeInTheDocument();
  });

  it("아이콘 svg는 스크린리더에서 숨겨진다", () => {
    const { container } = render(<InfoBox text="안내 문구" />);

    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("className이 기본 클래스와 병합되어 루트에 적용되고 충돌하는 기본값은 덮어쓴다", () => {
    const { container } = render(<InfoBox text="안내 문구" className="w-80" />);

    expect(container.firstChild).toHaveClass("w-80", "rounded-xl");
    expect(container.firstChild).not.toHaveClass("w-full");
  });

  it("icon을 전달하면 기본 info 아이콘 대신 전달한 아이콘을 렌더한다", () => {
    const { container } = render(
      <InfoBox text="안내 문구" icon={<span data-testid="custom-icon" />} />,
    );

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeNull();
  });
});
