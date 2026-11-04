import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TextButton from "@/components/TextButton";

describe("TextButton", () => {
  it("label 텍스트가 버튼 접근 가능한 이름으로 노출된다", () => {
    render(<TextButton label="더보기" />);

    expect(screen.getByRole("button", { name: "더보기" })).toBeInTheDocument();
  });

  it.each([
    ["small", "size-4"],
    ["medium", "size-4"],
    ["large", "size-5"],
  ] as const)('size="%s"면 아이콘에 %s 클래스가 적용된다', (size, iconSizeClass) => {
    render(<TextButton label="더보기" size={size} />);
    const icon = screen.getByRole("button", { name: "더보기" }).lastElementChild as HTMLElement;

    expect(icon.className).toContain(iconSizeClass);
  });

  it.each([
    ["neutral", "text-semantic-text-primary"],
    ["brand", "text-semantic-text-brand"],
    ["danger", "text-semantic-text-danger"],
  ] as const)('color="%s"면 지정된 텍스트 색 클래스가 적용된다', (color, textClass) => {
    render(<TextButton label="더보기" color={color} />);

    expect(screen.getByRole("button", { name: "더보기" }).className).toContain(textClass);
  });

  it("disabled=true면 버튼에 disabled 속성과 opacity-30 클래스가 적용된다", () => {
    render(<TextButton label="더보기" disabled />);
    const button = screen.getByRole("button", { name: "더보기" });

    expect(button).toBeDisabled();
    expect(button.className).toContain("opacity-30");
  });

  it("disabled=true 상태에서는 클릭해도 onClick이 호출되지 않는다", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<TextButton label="더보기" disabled onClick={handleClick} />);

    await user.click(screen.getByRole("button", { name: "더보기" }));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("rightIcon=false면 아이콘이 렌더되지 않는다", () => {
    render(<TextButton label="더보기" rightIcon={false} />);
    const button = screen.getByRole("button", { name: "더보기" });

    expect(button.querySelector("svg")).not.toBeInTheDocument();
  });

  it("onClick 등 button 네이티브 props가 전달되어 클릭 시 호출된다", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<TextButton label="더보기" onClick={handleClick} />);

    await user.click(screen.getByRole("button", { name: "더보기" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
