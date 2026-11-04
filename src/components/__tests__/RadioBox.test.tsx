import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RadioBox from "@/components/RadioBox";

describe("RadioBox", () => {
  it("ref가 내부 radio input에 연결된다", () => {
    const ref = createRef<HTMLInputElement>();
    render(<RadioBox ref={ref} label="1만원" />);

    expect(ref.current).toBe(screen.getByRole("radio"));
  });

  it("label 텍스트를 클릭하면 라디오가 선택되고 onChange가 호출된다", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<RadioBox name="amount" value="10000" label="1만원" onChange={handleChange} />);

    await user.click(screen.getByText("1만원"));

    expect(screen.getByRole("radio")).toBeChecked();
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("label로 라디오에 접근할 수 있다", () => {
    render(<RadioBox label="1만원" />);

    expect(screen.getByRole("radio", { name: "1만원" })).toBeInTheDocument();
  });

  it("label이 없으면 레이블 텍스트 없이 aria-label로 접근할 수 있다", () => {
    render(<RadioBox aria-label="선택" />);

    const radio = screen.getByRole("radio", { name: "선택" });
    expect(radio.closest("label")?.textContent).toBe("");
  });

  it("같은 name의 RadioBox 중 하나를 고르면 다른 하나는 선택 해제된다", async () => {
    const user = userEvent.setup();
    render(
      <>
        <RadioBox name="amount" value="10000" label="1만원" />
        <RadioBox name="amount" value="30000" label="3만원" />
      </>,
    );
    const first = screen.getByRole("radio", { name: "1만원" });
    const second = screen.getByRole("radio", { name: "3만원" });

    await user.click(first);
    await user.click(second);

    expect(first).not.toBeChecked();
    expect(second).toBeChecked();
  });

  it("defaultChecked면 처음부터 선택된 상태로 렌더된다", () => {
    render(<RadioBox label="1만원" defaultChecked />);

    expect(screen.getByRole("radio")).toBeChecked();
  });

  it("checked를 제어하면 부모 값이 바뀔 때만 선택 상태가 바뀐다", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<RadioBox label="1만원" checked={false} onChange={handleChange} />);
    const radio = screen.getByRole("radio");

    await user.click(radio);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(radio).not.toBeChecked();

    rerender(<RadioBox label="1만원" checked onChange={handleChange} />);

    expect(radio).toBeChecked();
  });

  it("label이 숫자 0이어도 레이블 텍스트 영역에 렌더된다", () => {
    render(<RadioBox label={0} />);

    const label = screen.getByRole("radio", { name: "0" }).closest("label");
    expect(screen.getByText("0")).not.toBe(label);
  });

  it("같은 name 그룹에서 방향키로 선택이 이동한다", async () => {
    const user = userEvent.setup();
    render(
      <>
        <RadioBox name="amount" value="10000" label="1만원" />
        <RadioBox name="amount" value="30000" label="3만원" />
      </>,
    );
    const first = screen.getByRole("radio", { name: "1만원" });
    const second = screen.getByRole("radio", { name: "3만원" });

    await user.click(first);
    await user.keyboard("{ArrowDown}");

    expect(second).toBeChecked();
    expect(second).toHaveFocus();

    await user.keyboard("{ArrowUp}");

    expect(first).toBeChecked();
  });

  it("disabled면 클릭해도 선택되지 않고 onChange가 호출되지 않는다", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<RadioBox label="1만원" disabled onChange={handleChange} />);

    await user.click(screen.getByText("1만원"));

    expect(screen.getByRole("radio")).not.toBeChecked();
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("disabled면 label에 opacity-30이 붙는다", () => {
    render(<RadioBox label="1만원" disabled />);

    expect(screen.getByRole("radio").closest("label")).toHaveClass("opacity-30");
  });

  it("className이 label 요소에 병합된다", () => {
    render(<RadioBox label="1만원" className="mt-4" />);

    const label = screen.getByRole("radio").closest("label");
    expect(label).toHaveClass("mt-4");
    expect(label).toHaveClass("inline-flex");
  });
});
