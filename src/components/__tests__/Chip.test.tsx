import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Chip from "@/components/Chip";

describe("Chip", () => {
  it("label이 버튼 이름으로 렌더되고 type이 button이다", () => {
    render(<Chip label="카카오" />);

    const button = screen.getByRole("button", { name: "카카오" });

    expect(button).toHaveAttribute("type", "button");
  });

  it.each([
    [true, "true"],
    [false, "false"],
  ] as const)("selected=%s면 aria-pressed가 %s이다", (selected, expected) => {
    render(<Chip label="카카오" selected={selected} />);

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", expected);
  });

  it("selected를 생략하면 aria-pressed가 false이다", () => {
    render(<Chip label="카카오" />);

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("클릭하면 onClick이 호출된다", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Chip label="카카오" onClick={handleClick} />);

    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disabled면 클릭해도 onClick이 호출되지 않는다", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Chip label="카카오" disabled onClick={handleClick} />);

    await user.click(screen.getByRole("button"));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("size를 생략하면 기본값 medium이 적용되어 h-[38px] 클래스가 붙는다", () => {
    render(<Chip label="카카오" />);

    expect(screen.getByRole("button").className).toContain("h-[38px]");
  });

  it('size="small"이면 h-8 클래스가 붙고 h-[38px]는 붙지 않는다', () => {
    render(<Chip label="카카오" size="small" />);
    const button = screen.getByRole("button");

    expect(button.className).toContain("h-8");
    expect(button.className).not.toContain("h-[38px]");
  });

  it("logo, leftIcon, rightIcon을 넘기면 모두 렌더된다", () => {
    render(
      <Chip
        label="카카오"
        logo={<span data-testid="logo" />}
        leftIcon={<svg data-testid="left" />}
        rightIcon={<svg data-testid="right" />}
      />,
    );

    expect(screen.getByTestId("logo")).toBeInTheDocument();
    expect(screen.getByTestId("left")).toBeInTheDocument();
    expect(screen.getByTestId("right")).toBeInTheDocument();
  });

  it("logo, leftIcon, rightIcon을 생략하면 아이콘 요소가 렌더되지 않는다", () => {
    render(<Chip label="카카오" />);

    const button = screen.getByRole("button");

    expect(button.querySelector("svg, img")).toBeNull();
    expect(button).toHaveTextContent(/^카카오$/);
  });
});
