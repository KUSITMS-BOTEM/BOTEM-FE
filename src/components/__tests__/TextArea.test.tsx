import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TextArea from "@/components/TextArea";

const CLEAR_BUTTON = { name: "입력 내용 지우기" };

describe("TextArea", () => {
  it("레이블을 클릭하면 textarea에 포커스가 간다", async () => {
    const user = userEvent.setup();
    render(<TextArea label="소개" />);

    await user.click(screen.getByText("소개"));

    expect(screen.getByLabelText("소개")).toHaveFocus();
  });

  it("입력하면 글자 수가 갱신된다", async () => {
    const user = userEvent.setup();
    render(<TextArea label="소개" maxLength={100} />);

    await user.type(screen.getByLabelText("소개"), "안녕하세요");

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("/100")).toBeInTheDocument();
  });

  it("maxLength를 넘겨 입력하면 더 입력되지 않고 에러 상태가 된다", async () => {
    const user = userEvent.setup();
    render(<TextArea label="소개" maxLength={5} />);
    const textarea = screen.getByLabelText("소개");

    await user.type(textarea, "안녕하세요요");

    expect(textarea).toHaveValue("안녕하세요");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  it("값이 없으면 지우기 버튼이 없다", () => {
    render(<TextArea label="소개" />);

    expect(screen.queryByRole("button", CLEAR_BUTTON)).not.toBeInTheDocument();
  });

  it("지우기 버튼을 누르면 값이 비워지고 onClear가 호출되며 textarea 포커스가 유지된다", async () => {
    const handleClear = vi.fn();
    const user = userEvent.setup();
    render(<TextArea label="소개" defaultValue="내용" onClear={handleClear} />);
    const textarea = screen.getByLabelText("소개");
    await user.click(textarea);

    await user.click(screen.getByRole("button", CLEAR_BUTTON));

    expect(textarea).toHaveValue("");
    expect(handleClear).toHaveBeenCalledTimes(1);
    expect(textarea).toHaveFocus();
  });

  it("제어 모드에서 지우기 버튼을 누르면 onClear만 호출되고 값은 부모가 정한 그대로다", async () => {
    const handleClear = vi.fn();
    const user = userEvent.setup();
    render(<TextArea label="소개" value="내용" onChange={() => {}} onClear={handleClear} />);
    const textarea = screen.getByLabelText("소개");
    await user.click(textarea);

    await user.click(screen.getByRole("button", CLEAR_BUTTON));

    expect(handleClear).toHaveBeenCalledTimes(1);
    expect(textarea).toHaveValue("내용");
  });

  it("비제어 모드에서 입력하면 값이 바뀌고 onChange가 호출된다", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<TextArea label="소개" onChange={handleChange} />);
    const textarea = screen.getByLabelText("소개");

    await user.type(textarea, "abc");

    expect(textarea).toHaveValue("abc");
    expect(handleChange).toHaveBeenCalledTimes(3);
  });

  it("blur되면 넘겨준 onBlur가 호출된다", async () => {
    const handleBlur = vi.fn();
    const user = userEvent.setup();
    render(<TextArea label="소개" onBlur={handleBlur} />);

    await user.click(screen.getByLabelText("소개"));
    await user.tab();

    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it("value를 외부에서 넘겨도 입력하면 onChange가 호출된다", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<TextArea label="소개" value="abc" onChange={handleChange} />);

    await user.type(screen.getByLabelText("소개"), "d");

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("error이면 aria-invalid가 true이고 helperText가 aria-describedby로 연결된다", () => {
    render(<TextArea label="소개" error helperText="필수 항목입니다" />);
    const textarea = screen.getByLabelText("소개");

    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAccessibleDescription("필수 항목입니다");
  });

  it("disabled이면 값이 있어도 지우기 버튼이 없다", () => {
    render(<TextArea label="소개" defaultValue="내용" disabled />);

    expect(screen.queryByRole("button", CLEAR_BUTTON)).not.toBeInTheDocument();
  });

  it("helperText와 maxLength가 모두 없으면 도움말 줄이 렌더되지 않는다", () => {
    render(<TextArea label="소개" />);

    expect(screen.getByLabelText("소개").closest("div.group")?.nextElementSibling).toBeNull();
  });

  it("required이면 textarea에 required 속성이 붙는다", () => {
    render(<TextArea label="소개" required />);

    expect(screen.getByLabelText("소개")).toBeRequired();
  });
});
