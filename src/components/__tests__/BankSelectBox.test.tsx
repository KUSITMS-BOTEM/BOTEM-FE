import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import BankSelectBox from "@/components/BankSelectBox";

describe("BankSelectBox", () => {
  it("text가 버튼의 접근 가능한 이름으로 렌더되고 type이 button이다", () => {
    render(<BankSelectBox selected={false} text="카카오뱅크" image={<svg />} />);

    const button = screen.getByRole("button", { name: "카카오뱅크" });

    expect(button).toHaveAttribute("type", "button");
  });

  it.each([
    [true, "true"],
    [false, "false"],
  ] as const)("selected=%s면 aria-pressed가 %s이다", (selected, expected) => {
    render(<BankSelectBox selected={selected} text="카카오뱅크" image={<svg />} />);

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", expected);
  });

  it("selected=true면 선택됨 배경·보더 클래스가 적용된다", () => {
    render(<BankSelectBox selected text="카카오뱅크" image={<svg />} />);
    const button = screen.getByRole("button");

    expect(button.className).toContain("bg-semantic-fill-default");
    expect(button.className).toContain("border-semantic-border-strong");
  });

  it("selected=false면 미선택 배경·투명 보더 클래스가 적용된다", () => {
    render(<BankSelectBox selected={false} text="카카오뱅크" image={<svg />} />);
    const button = screen.getByRole("button");

    expect(button.className).toContain("bg-semantic-fill-neutral-weak");
    expect(button.className).toContain("border-transparent");
  });

  it("selected=true면 텍스트에 strong 폰트 클래스가 적용된다", () => {
    render(<BankSelectBox selected text="카카오뱅크" image={<svg />} />);

    expect(screen.getByText("카카오뱅크").className).toContain(
      "[font:var(--semantic-label-small-strong)]",
    );
  });

  it("selected=false면 텍스트에 weak 폰트 클래스가 적용된다", () => {
    render(<BankSelectBox selected={false} text="카카오뱅크" image={<svg />} />);

    expect(screen.getByText("카카오뱅크").className).toContain(
      "[font:var(--semantic-label-small-weak)]",
    );
  });

  it("selected=true면 이미지 래퍼에 원형 배경 클래스가 추가된다", () => {
    render(<BankSelectBox selected text="카카오뱅크" image={<svg data-testid="logo" />} />);

    const wrapper = screen.getByTestId("logo").parentElement;

    expect(wrapper?.className).toContain("rounded-full");
  });

  it("selected=false면 이미지 래퍼에 원형 배경 클래스가 없다", () => {
    render(<BankSelectBox selected={false} text="카카오뱅크" image={<svg data-testid="logo" />} />);

    const wrapper = screen.getByTestId("logo").parentElement;

    expect(wrapper?.className).not.toContain("rounded-full");
  });

  it("image prop으로 전달한 요소가 버튼 내부에 렌더된다", () => {
    render(<BankSelectBox selected={false} text="카카오뱅크" image={<svg data-testid="logo" />} />);

    expect(screen.getByRole("button")).toContainElement(screen.getByTestId("logo"));
  });

  it("className은 기존 클래스와 함께 적용된다", () => {
    render(<BankSelectBox selected={false} text="카카오뱅크" image={<svg />} className="mt-4" />);
    const button = screen.getByRole("button");

    expect(button.className).toContain("mt-4");
    expect(button.className).toContain("rounded-large");
  });

  it("클릭하면 onClick이 1회 호출된다", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <BankSelectBox selected={false} text="카카오뱅크" image={<svg />} onClick={handleClick} />,
    );

    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disabled면 클릭해도 onClick이 호출되지 않는다", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <BankSelectBox
        selected={false}
        text="카카오뱅크"
        image={<svg />}
        disabled
        onClick={handleClick}
      />,
    );

    await user.click(screen.getByRole("button"));

    expect(handleClick).not.toHaveBeenCalled();
  });
});
