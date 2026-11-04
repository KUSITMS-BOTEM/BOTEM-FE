import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import IconButton from "@/components/IconButton";

describe("IconButton", () => {
  it("icon prop으로 전달한 요소가 그대로 렌더된다", () => {
    render(<IconButton icon={<svg data-testid="icon" />} aria-label="아이콘버튼" />);

    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("onClick이 전달되면 클릭 시 호출된다", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <IconButton
        icon={<svg data-testid="icon" />}
        aria-label="아이콘버튼"
        onClick={handleClick}
      />,
    );

    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("size를 생략하면 기본값 small이 적용되어 size-6 클래스가 붙는다", () => {
    render(<IconButton icon={<svg data-testid="icon" />} aria-label="아이콘버튼" />);

    expect(screen.getByRole("button").className).toContain("size-6");
  });

  it.each([
    ["small", "size-6"],
    ["medium", "size-7"],
    ["large", "size-9"],
    ["xlarge", "size-10"],
  ] as const)('size="%s"면 %s 클래스가 적용된다', (size, sizeClass) => {
    render(<IconButton size={size} icon={<svg data-testid="icon" />} aria-label="아이콘버튼" />);

    expect(screen.getByRole("button").className).toContain(sizeClass);
  });

  it("variant를 생략하면 기본값 ghost가 적용되어 stroke 배경 클래스가 붙지 않는다", () => {
    render(<IconButton icon={<svg data-testid="icon" />} aria-label="아이콘버튼" />);

    expect(screen.getByRole("button").className).not.toContain("border-semantic-border-weak");
  });

  it('variant="stroke"면 테두리·배경 클래스가 적용된다', () => {
    render(
      <IconButton variant="stroke" icon={<svg data-testid="icon" />} aria-label="아이콘버튼" />,
    );
    const button = screen.getByRole("button");

    expect(button.className).toContain("border-semantic-border-weak");
    expect(button.className).toContain("bg-semantic-fill-default/80");
  });

  it("disabled를 생략하면 기본값 false가 적용되어 버튼이 활성 상태다", () => {
    render(<IconButton icon={<svg data-testid="icon" />} aria-label="아이콘버튼" />);

    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("disabled=true면 버튼에 disabled 속성과 opacity-30 클래스가 적용된다", () => {
    render(<IconButton disabled icon={<svg data-testid="icon" />} aria-label="아이콘버튼" />);
    const button = screen.getByRole("button");

    expect(button).toBeDisabled();
    expect(button.className).toContain("opacity-30");
  });

  it("icon으로 null을 전달해도 에러 없이 렌더된다", () => {
    render(<IconButton icon={null} aria-label="아이콘버튼" />);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("disabled=true 상태에서는 클릭해도 onClick이 호출되지 않는다", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <IconButton
        disabled
        icon={<svg data-testid="icon" />}
        aria-label="아이콘버튼"
        onClick={handleClick}
      />,
    );

    await user.click(screen.getByRole("button"));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("className prop이 기존 클래스와 함께 병합되어 적용된다", () => {
    render(
      <IconButton icon={<svg data-testid="icon" />} aria-label="아이콘버튼" className="mt-4" />,
    );
    const button = screen.getByRole("button");

    expect(button.className).toContain("mt-4");
    expect(button.className).toContain("rounded-full");
  });

  it("aria-label 같은 button HTML 속성이 그대로 전달된다", () => {
    render(<IconButton icon={<svg data-testid="icon" />} aria-label="아이콘버튼" />);

    expect(screen.getByRole("button", { name: "아이콘버튼" })).toBeInTheDocument();
  });
});
