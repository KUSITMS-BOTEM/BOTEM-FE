import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Header from "@/components/Header";

describe("Header", () => {
  it("title prop으로 전달한 텍스트가 그대로 렌더된다", () => {
    render(<Header title="보탬" />);

    expect(screen.getByText("보탬")).toBeInTheDocument();
  });

  it("leftItem이 없으면 왼쪽 버튼이 렌더되지 않는다", () => {
    render(<Header title="보탬" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("rightItems를 생략하면 오른쪽 버튼이 렌더되지 않는다", () => {
    render(<Header title="보탬" />);

    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("rightItems가 빈 배열이면 오른쪽 버튼이 렌더되지 않는다", () => {
    render(<Header title="보탬" rightItems={[]} />);

    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("rightItems가 2개면 둘 다 렌더되고 각 onClick이 정확히 호출된다", async () => {
    const handleFirst = vi.fn();
    const handleSecond = vi.fn();
    const user = userEvent.setup();
    render(
      <Header
        title="보탬"
        rightItems={[
          { icon: <svg data-testid="icon-1" />, ariaLabel: "첫번째", onClick: handleFirst },
          { icon: <svg data-testid="icon-2" />, ariaLabel: "두번째", onClick: handleSecond },
        ]}
      />,
    );

    expect(screen.getAllByRole("button")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "첫번째" }));
    expect(handleFirst).toHaveBeenCalledTimes(1);
    expect(handleSecond).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "두번째" }));
    expect(handleSecond).toHaveBeenCalledTimes(1);
  });

  it("leftItem이 있으면 왼쪽 버튼이 렌더되고 클릭 시 onClick이 호출된다", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Header
        title="보탬"
        leftItem={{
          icon: <svg data-testid="icon-back" />,
          ariaLabel: "뒤로가기",
          onClick: handleClick,
        }}
      />,
    );

    const button = screen.getByRole("button", { name: "뒤로가기" });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("className prop이 기존 클래스와 함께 병합되어 적용된다", () => {
    render(<Header title="보탬" className="mt-4" />);
    const header = screen.getByText("보탬").closest("header");

    expect(header?.className).toContain("mt-4");
    expect(header?.className).toContain("h-16");
  });
});
