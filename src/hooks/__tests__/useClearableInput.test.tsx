import { type ChangeEvent, createRef, type Ref } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import useClearableInput from "@/hooks/useClearableInput";

type TestInputProps = {
  value?: string;
  defaultValue?: string;
  inputRef?: Ref<HTMLInputElement>;
  maxLength?: number;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
};

function TestInput({
  value,
  defaultValue = "",
  inputRef,
  maxLength,
  onChange,
  onClear,
}: TestInputProps) {
  const { elementRef, currentValue, isOverLimit, handleChange, handleClear } = useClearableInput({
    value,
    defaultValue,
    ref: inputRef,
    maxLength,
    onChange,
    onClear,
  });

  return (
    <>
      <input
        ref={elementRef}
        aria-label="입력"
        aria-invalid={isOverLimit}
        value={currentValue}
        onChange={handleChange}
      />
      <button type="button" onClick={handleClear}>
        지우기
      </button>
    </>
  );
}

describe("useClearableInput", () => {
  it("객체 ref에 실제 요소가 연결된다", () => {
    const ref = createRef<HTMLInputElement>();
    render(<TestInput inputRef={ref} />);

    expect(ref.current).toBe(screen.getByLabelText("입력"));
  });

  it("콜백 ref는 마운트 후 한 번만 요소로 호출된다", () => {
    const ref = vi.fn();
    const { rerender } = render(<TestInput inputRef={ref} />);

    rerender(<TestInput inputRef={ref} />);

    expect(ref).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledWith(screen.getByLabelText("입력"));
  });

  it("비제어 모드에서 지우면 값이 비워지고 요소에 포커스된다", async () => {
    const handleClear = vi.fn();
    const user = userEvent.setup();
    render(<TestInput defaultValue="보탬" onClear={handleClear} />);

    await user.click(screen.getByRole("button", { name: "지우기" }));

    expect(screen.getByLabelText("입력")).toHaveValue("");
    expect(screen.getByLabelText("입력")).toHaveFocus();
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  describe("maxLength", () => {
    it("초과 입력은 maxLength까지 잘리고 초과 상태가 된다", () => {
      render(<TestInput maxLength={5} />);
      const input = screen.getByLabelText("입력");

      fireEvent.change(input, { target: { value: "보탬보탬보탬" } });

      expect(input).toHaveValue("보탬보탬보");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("제어 모드에서는 잘린 값이 onChange로 전달된다", () => {
      const handleChange = vi.fn((event: ChangeEvent<HTMLInputElement>) => event.target.value);
      render(<TestInput value="" maxLength={5} onChange={handleChange} />);

      fireEvent.change(screen.getByLabelText("입력"), { target: { value: "보탬보탬보탬" } });

      expect(handleChange).toHaveReturnedWith("보탬보탬보");
    });

    it("maxLength 미만으로 지우면 초과 상태가 풀린다", () => {
      render(<TestInput maxLength={5} />);
      const input = screen.getByLabelText("입력");
      fireEvent.change(input, { target: { value: "보탬보탬보탬" } });

      fireEvent.change(input, { target: { value: "보탬보탬" } });

      expect(input).toHaveAttribute("aria-invalid", "false");
    });

    it("정확히 maxLength만큼 입력하면 초과 상태가 아니다", () => {
      render(<TestInput maxLength={5} />);
      const input = screen.getByLabelText("입력");

      fireEvent.change(input, { target: { value: "보탬보탬보" } });

      expect(input).toHaveAttribute("aria-invalid", "false");
    });

    it("가득 찬 상태에서 중간에 입력하면 새 입력만 버려지고 기존 글자와 커서 위치는 유지된다", async () => {
      const user = userEvent.setup();
      render(<TestInput defaultValue="가나다라마" maxLength={5} />);
      const input = screen.getByLabelText<HTMLInputElement>("입력");

      await user.type(input, "X", { initialSelectionStart: 1, initialSelectionEnd: 1 });

      expect(input).toHaveValue("가나다라마");
      expect(input.selectionStart).toBe(1);
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("중간에 붙여넣으면 남은 자리만큼만 들어가고 뒤쪽 글자는 유지된다", async () => {
      const user = userEvent.setup();
      render(<TestInput defaultValue="가나다" maxLength={5} />);
      const input = screen.getByLabelText<HTMLInputElement>("입력");
      await user.click(input);
      input.setSelectionRange(1, 1);

      await user.paste("ABCD");

      expect(input).toHaveValue("가AB나다");
      expect(input.selectionStart).toBe(3);
    });

    it.each([
      ["이모지", "😀"],
      ["피부색 이모지", "👍🏻"],
      ["가족 이모지", "👨‍👩‍👧"],
    ])("%s가 제한에 걸리면 반쪽만 남지 않고 통째로 버려진다", (_, emoji) => {
      render(<TestInput maxLength={5} />);
      const input = screen.getByLabelText("입력");

      fireEvent.change(input, { target: { value: `가나다라${emoji}` } });

      expect(input).toHaveValue("가나다라");
      expect(input).toHaveAttribute("aria-invalid", "false");
    });

    it("제어 모드에서 부모가 값을 maxLength 미만으로 바꾸면 초과 상태가 풀린다", () => {
      const { rerender } = render(<TestInput value="보탬보탬보" maxLength={5} />);
      const input = screen.getByLabelText("입력");
      fireEvent.change(input, { target: { value: "보탬보탬보탬" } });
      expect(input).toHaveAttribute("aria-invalid", "true");

      rerender(<TestInput value="" maxLength={5} />);

      expect(input).toHaveAttribute("aria-invalid", "false");
    });

    it("지우기 버튼을 누르면 초과 상태가 풀린다", async () => {
      const user = userEvent.setup();
      render(<TestInput maxLength={5} />);
      const input = screen.getByLabelText("입력");
      fireEvent.change(input, { target: { value: "보탬보탬보탬" } });

      await user.click(screen.getByRole("button", { name: "지우기" }));

      expect(input).toHaveAttribute("aria-invalid", "false");
    });
  });
});
