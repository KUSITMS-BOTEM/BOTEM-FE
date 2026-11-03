import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TextField from "@/components/TextField";

const CLEAR_BUTTON = { name: "입력 내용 지우기" };
const MIN_LENGTH_RULE = { message: "8자 이상", validate: (value: string) => value.length >= 8 };
const HAS_DIGIT_RULE = { message: "숫자 포함", validate: (value: string) => /\d/.test(value) };

const getRuleText = (message: string) => screen.getByText(message).closest("div");

describe("TextField", () => {
  it("레이블을 클릭하면 input에 포커스가 간다", async () => {
    const user = userEvent.setup();
    render(<TextField label="이름" />);

    await user.click(screen.getByText("이름"));

    expect(screen.getByLabelText("이름")).toHaveFocus();
  });

  it("입력하면 글자 수가 갱신된다", async () => {
    const user = userEvent.setup();
    render(<TextField label="이름" maxLength={10} />);

    await user.type(screen.getByLabelText("이름"), "보탬");

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("/10")).toBeInTheDocument();
  });

  it("maxLength를 넘겨 입력하면 더 입력되지 않고 에러 상태가 된다", async () => {
    const user = userEvent.setup();
    render(<TextField label="이름" maxLength={5} />);
    const input = screen.getByLabelText("이름");

    await user.type(input, "보탬보탬보탬");

    expect(input).toHaveValue("보탬보탬보");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("초과로 에러가 난 뒤 maxLength 미만으로 지우면 에러가 풀린다", async () => {
    const user = userEvent.setup();
    render(<TextField label="이름" maxLength={5} />);
    const input = screen.getByLabelText("이름");
    await user.type(input, "보탬보탬보탬");

    await user.type(input, "{Backspace}");

    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("값이 없으면 지우기 버튼이 없다", () => {
    render(<TextField label="이름" />);

    expect(screen.queryByRole("button", CLEAR_BUTTON)).not.toBeInTheDocument();
  });

  it("지우기 버튼을 누르면 값이 비워지고 onClear가 호출되며 input 포커스가 유지된다", async () => {
    const handleClear = vi.fn();
    const user = userEvent.setup();
    render(<TextField label="이름" defaultValue="보탬" onClear={handleClear} />);
    const input = screen.getByLabelText("이름");
    await user.click(input);

    await user.click(screen.getByRole("button", CLEAR_BUTTON));

    expect(input).toHaveValue("");
    expect(handleClear).toHaveBeenCalledTimes(1);
    expect(input).toHaveFocus();
  });

  it("value를 외부에서 넘겨도 입력하면 onChange가 호출된다", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<TextField label="이름" value="abc" onChange={handleChange} />);

    await user.type(screen.getByLabelText("이름"), "d");

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("error이면 aria-invalid가 true이고 helperText가 aria-describedby로 연결된다", () => {
    render(<TextField label="이름" error helperText="필수 항목입니다" />);
    const input = screen.getByLabelText("이름");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("필수 항목입니다");
  });

  it("helperText 없이 maxLength만 있어도 글자 수 카운터가 설명으로 연결된다", () => {
    render(<TextField label="이름" maxLength={20} defaultValue="보탬" />);

    expect(screen.getByLabelText("이름")).toHaveAccessibleDescription(/2\s*\/\s*20/);
  });

  it("호출하는 쪽의 aria-describedby는 내부 도움말과 합쳐지고, aria-invalid는 내부 상태가 우선한다", () => {
    render(
      <>
        <span id="external">외부 설명</span>
        <TextField
          label="이름"
          helperText="도움말"
          aria-describedby="external"
          aria-invalid={false}
          error
        />
      </>,
    );
    const input = screen.getByLabelText("이름");

    expect(input).toHaveAccessibleDescription(/외부 설명.*도움말/);
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("suffix를 넘기면 표시된다", () => {
    render(<TextField label="금액" suffix="원" />);

    expect(screen.getByText("원")).toBeInTheDocument();
  });

  it("disabled여도 suffix는 보이고 지우기 버튼은 없다", () => {
    render(<TextField label="금액" suffix="원" defaultValue="10000" disabled />);

    expect(screen.getByText("원")).toBeInTheDocument();
    expect(screen.queryByRole("button", CLEAR_BUTTON)).not.toBeInTheDocument();
  });

  it("readOnly이면 값이 있어도 지우기 버튼이 없고 input이 읽기 전용이다", () => {
    render(<TextField label="이름" defaultValue="보탬" readOnly />);

    expect(screen.queryByRole("button", CLEAR_BUTTON)).not.toBeInTheDocument();
    expect(screen.getByLabelText("이름")).toHaveAttribute("readonly");
  });

  it("제어 모드에서 onClear가 없으면 지우기 버튼이 없다", () => {
    render(<TextField label="이름" value="보탬" onChange={() => {}} />);

    expect(screen.queryByRole("button", CLEAR_BUTTON)).not.toBeInTheDocument();
  });

  it("값이 없으면 rules 문구가 모두 default 색이다", () => {
    render(<TextField label="비밀번호" rules={[MIN_LENGTH_RULE, HAS_DIGIT_RULE]} />);

    expect(getRuleText("8자 이상")).toHaveClass("text-semantic-text-tertiary");
    expect(getRuleText("숫자 포함")).toHaveClass("text-semantic-text-tertiary");
  });

  it("입력 중에는 조건별로 success/error 색이 나뉘지만 aria-invalid는 false다", async () => {
    const user = userEvent.setup();
    render(<TextField label="비밀번호" rules={[MIN_LENGTH_RULE, HAS_DIGIT_RULE]} />);
    const input = screen.getByLabelText("비밀번호");

    await user.type(input, "abc1");

    expect(getRuleText("8자 이상")).toHaveClass("text-semantic-text-danger");
    expect(getRuleText("숫자 포함")).toHaveClass("text-semantic-text-success");
    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("조건을 만족하지 못한 채 blur되면 aria-invalid가 true가 된다", async () => {
    const user = userEvent.setup();
    render(<TextField label="비밀번호" rules={[MIN_LENGTH_RULE]} />);
    const input = screen.getByLabelText("비밀번호");

    await user.type(input, "abc");
    await user.tab();

    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("에러 상태에서 다시 입력해 모든 조건을 만족하면 aria-invalid가 false가 된다", async () => {
    const user = userEvent.setup();
    render(<TextField label="비밀번호" rules={[MIN_LENGTH_RULE]} />);
    const input = screen.getByLabelText("비밀번호");
    await user.type(input, "abc");
    await user.tab();

    await user.type(input, "defgh");

    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("에러 상태에서 지우기 버튼을 누르면 에러가 해제된다", async () => {
    const user = userEvent.setup();
    render(<TextField label="비밀번호" rules={[MIN_LENGTH_RULE]} />);
    const input = screen.getByLabelText("비밀번호");
    await user.type(input, "abc");
    await user.tab();

    await user.click(screen.getByRole("button", CLEAR_BUTTON));

    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("빈 값으로 blur되면 에러가 아니다", async () => {
    const user = userEvent.setup();
    render(<TextField label="비밀번호" rules={[MIN_LENGTH_RULE]} />);
    const input = screen.getByLabelText("비밀번호");

    await user.click(input);
    await user.tab();

    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("제어 모드에서 지우기 버튼을 누르면 onClear만 호출되고 값은 부모가 정한 그대로다", async () => {
    const handleClear = vi.fn();
    const user = userEvent.setup();
    render(<TextField label="이름" value="보탬" onChange={() => {}} onClear={handleClear} />);
    const input = screen.getByLabelText("이름");
    await user.click(input);

    await user.click(screen.getByRole("button", CLEAR_BUTTON));

    expect(handleClear).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue("보탬");
  });

  it("비제어 모드에서 입력하면 값이 바뀌고 onChange가 호출된다", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<TextField label="이름" onChange={handleChange} />);
    const input = screen.getByLabelText("이름");

    await user.type(input, "abc");

    expect(input).toHaveValue("abc");
    expect(handleChange).toHaveBeenCalledTimes(3);
  });

  it("blur되면 넘겨준 onBlur가 호출된다", async () => {
    const handleBlur = vi.fn();
    const user = userEvent.setup();
    render(<TextField label="비밀번호" rules={[MIN_LENGTH_RULE]} onBlur={handleBlur} />);

    await user.click(screen.getByLabelText("비밀번호"));
    await user.tab();

    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it("helperText와 rules를 함께 넘기면 둘 다 표시되고 aria-describedby로 연결된다", () => {
    render(
      <TextField
        label="비밀번호"
        helperText="영문을 포함해 주세요"
        rules={[MIN_LENGTH_RULE, HAS_DIGIT_RULE]}
      />,
    );

    expect(screen.getByLabelText("비밀번호")).toHaveAccessibleDescription(
      "영문을 포함해 주세요 8자 이상 숫자 포함",
    );
  });

  it("제어 모드에서 규칙 에러 후 부모가 값을 비우면 에러가 해제된다", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <TextField label="비밀번호" value="abc" onChange={() => {}} rules={[MIN_LENGTH_RULE]} />,
    );
    const input = screen.getByLabelText("비밀번호");
    await user.click(input);
    await user.tab();
    expect(input).toHaveAttribute("aria-invalid", "true");

    rerender(<TextField label="비밀번호" value="" onChange={() => {}} rules={[MIN_LENGTH_RULE]} />);

    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("제어 모드에서 규칙 에러 후 부모가 조건을 만족하는 값으로 바꾸면 에러가 해제된다", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <TextField label="비밀번호" value="abc" onChange={() => {}} rules={[MIN_LENGTH_RULE]} />,
    );
    const input = screen.getByLabelText("비밀번호");
    await user.click(input);
    await user.tab();

    rerender(
      <TextField label="비밀번호" value="abcdefgh" onChange={() => {}} rules={[MIN_LENGTH_RULE]} />,
    );

    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("error prop은 rules와 무관하게 aria-invalid를 true로 만든다", () => {
    render(<TextField label="비밀번호" rules={[MIN_LENGTH_RULE]} defaultValue="abcdefgh" error />);

    expect(screen.getByLabelText("비밀번호")).toHaveAttribute("aria-invalid", "true");
  });
});
