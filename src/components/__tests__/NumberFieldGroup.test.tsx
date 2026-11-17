import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import NumberFieldGroup from "@/components/NumberFieldGroup";

function Harness() {
  const [value, setValue] = useState("");
  return <NumberFieldGroup label="비밀번호" value={value} onChange={setValue} />;
}

describe("NumberFieldGroup", () => {
  it("숫자 키패드만 뜨도록 inputMode=numeric 이고 4자리로 제한한다", () => {
    render(<Harness />);
    const input = screen.getByLabelText("비밀번호");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).toHaveAttribute("maxlength", "4");
  });

  it("숫자가 아닌 입력은 제거한다", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText("비밀번호");
    await user.type(input, "1a2-3");
    expect(input).toHaveValue("123");
  });

  it("4자리를 넘겨 입력해도 4자리까지만 받는다", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText("비밀번호");
    await user.type(input, "123456");
    expect(input).toHaveValue("1234");
  });

  it("입력한 자리 수만큼 마스킹 아이콘이 보이고 입력값은 화면에 노출되지 않는다", async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);
    await user.type(screen.getByLabelText("비밀번호"), "12");
    expect(container.querySelectorAll("svg")).toHaveLength(2);
    expect(screen.getByLabelText("비밀번호")).toHaveAttribute("type", "password");
  });

  it("포커스 전에는 활성 칸이 없고 포커스하면 맨 왼쪽 칸이 활성화된다", async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);
    const boxes = () => Array.from(container.querySelectorAll<HTMLElement>("[aria-hidden]"));
    const isActive = (box: HTMLElement) => box.className.includes("border-semantic-border-strong");

    expect(boxes().some(isActive)).toBe(false);

    await user.click(screen.getByLabelText("비밀번호"));
    expect(boxes().map(isActive)).toEqual([true, false, false, false]);
  });

  it("입력할수록 활성 칸이 오른쪽으로 이동하고 4자리가 되면 마지막 칸에 머문다", async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);
    const boxes = () => Array.from(container.querySelectorAll<HTMLElement>("[aria-hidden]"));
    const isActive = (box: HTMLElement) => box.className.includes("border-semantic-border-strong");

    await user.click(screen.getByLabelText("비밀번호"));
    await user.keyboard("12");
    expect(boxes().map(isActive)).toEqual([false, false, true, false]);

    await user.keyboard("34");
    expect(boxes().map(isActive)).toEqual([false, false, false, true]);
  });

  it("값이 있는 상태에서 다시 눌러도 값을 유지하고 다음 빈 칸이 활성이다", async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);
    const input = screen.getByLabelText("비밀번호");
    await user.type(input, "12");
    await user.tab();
    await user.click(input);

    expect(input).toHaveValue("12");
    const boxes = Array.from(container.querySelectorAll<HTMLElement>("[aria-hidden]"));
    expect(boxes[2].className).toContain("border-semantic-border-strong");
  });

  it("Backspace로 마지막 자리부터 지운다", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText("비밀번호");
    await user.type(input, "1234");
    await user.keyboard("{Backspace}");
    expect(input).toHaveValue("123");
  });
});
