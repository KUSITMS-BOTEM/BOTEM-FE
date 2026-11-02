import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Combobox from "@/components/Combobox";

const CLEAR_LABEL = "입력 내용 지우기";

const CHIPS = [
  { label: "카카오", value: "kakao" },
  { label: "네이버", value: "naver" },
];

describe("Combobox", () => {
  it("label을 클릭하면 input에 포커스된다", async () => {
    const user = userEvent.setup();
    render(<Combobox label="브랜드" />);

    await user.click(screen.getByText("브랜드"));

    expect(screen.getByLabelText("브랜드")).toHaveFocus();
  });

  describe("값 입력", () => {
    it("비제어 모드에서 타이핑하면 값이 바뀌고 onChange가 호출된다", async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<Combobox label="브랜드" onChange={handleChange} />);
      const input = screen.getByLabelText("브랜드");

      await user.type(input, "abc");

      expect(input).toHaveValue("abc");
      expect(handleChange).toHaveBeenCalledTimes(3);
    });

    it("defaultValue가 있으면 초기 값으로 표시된다", () => {
      render(<Combobox label="브랜드" defaultValue="초기값" />);

      expect(screen.getByLabelText("브랜드")).toHaveValue("초기값");
    });

    it("blur되면 넘겨준 onBlur가 호출된다", async () => {
      const handleBlur = vi.fn();
      const user = userEvent.setup();
      render(<Combobox label="브랜드" onBlur={handleBlur} />);

      await user.click(screen.getByLabelText("브랜드"));
      await user.tab();

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it("제어 모드에서는 value prop이 그대로 표시된다", () => {
      render(<Combobox label="브랜드" value="고정값" onChange={() => {}} />);

      expect(screen.getByLabelText("브랜드")).toHaveValue("고정값");
    });
  });

  describe("지우기 버튼", () => {
    it("값이 있으면 지우기 버튼이 DOM에 있다", () => {
      render(<Combobox label="브랜드" defaultValue="abc" />);

      expect(screen.getByRole("button", { name: CLEAR_LABEL })).toBeInTheDocument();
    });

    it("값이 비어 있으면 지우기 버튼이 없다", () => {
      render(<Combobox label="브랜드" />);

      expect(screen.queryByRole("button", { name: CLEAR_LABEL })).not.toBeInTheDocument();
    });

    it("클릭하면 값이 비워지고 onClear가 호출되며 input 포커스가 유지된다", async () => {
      const handleClear = vi.fn();
      const user = userEvent.setup();
      render(<Combobox label="브랜드" onClear={handleClear} />);
      const input = screen.getByLabelText("브랜드");
      await user.type(input, "abc");

      await user.click(screen.getByRole("button", { name: CLEAR_LABEL }));

      expect(input).toHaveValue("");
      expect(handleClear).toHaveBeenCalledTimes(1);
      expect(input).toHaveFocus();
    });

    it("제어 모드에서 클릭하면 onClear만 호출되고 값은 부모가 정한 그대로다", async () => {
      const handleClear = vi.fn();
      const user = userEvent.setup();
      render(<Combobox label="브랜드" value="abc" onChange={() => {}} onClear={handleClear} />);
      const input = screen.getByLabelText("브랜드");
      await user.click(input);

      await user.click(screen.getByRole("button", { name: CLEAR_LABEL }));

      expect(handleClear).toHaveBeenCalledTimes(1);
      expect(input).toHaveValue("abc");
    });

    it("값을 비우면 지우기 버튼이 사라진다", async () => {
      const user = userEvent.setup();
      render(<Combobox label="브랜드" defaultValue="abc" />);

      await user.click(screen.getByRole("button", { name: CLEAR_LABEL }));

      expect(screen.queryByRole("button", { name: CLEAR_LABEL })).not.toBeInTheDocument();
    });
  });

  describe("disabled", () => {
    it("값이 있어도 지우기 버튼이 없다", () => {
      render(<Combobox label="브랜드" defaultValue="abc" disabled />);

      expect(screen.queryByRole("button", { name: CLEAR_LABEL })).not.toBeInTheDocument();
    });

    it("input과 Chip이 모두 disabled이다", () => {
      render(<Combobox label="브랜드" disabled chips={CHIPS} />);

      expect(screen.getByLabelText("브랜드", { selector: "input" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "카카오" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "네이버" })).toBeDisabled();
    });
  });

  describe("suffix", () => {
    it("suffix를 넘기면 표시된다", () => {
      render(<Combobox label="금액" suffix="원" />);

      expect(screen.getByText("원")).toBeInTheDocument();
    });

    it("suffix를 생략하면 표시되지 않는다", () => {
      render(<Combobox label="금액" />);

      expect(screen.queryByText("원")).not.toBeInTheDocument();
    });
  });

  describe("글자수", () => {
    it("maxLength가 있으면 현재/최대 글자수가 표시된다", () => {
      render(<Combobox label="브랜드" maxLength={10} />);

      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("/10")).toBeInTheDocument();
    });

    it("입력에 따라 현재 글자수가 갱신된다", async () => {
      const user = userEvent.setup();
      render(<Combobox label="브랜드" maxLength={10} />);

      await user.type(screen.getByLabelText("브랜드"), "abc");

      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("/10")).toBeInTheDocument();
    });

    it("maxLength를 넘겨 입력하면 더 입력되지 않고 에러 상태가 된다", async () => {
      const user = userEvent.setup();
      render(<Combobox label="브랜드" maxLength={3} />);
      const input = screen.getByLabelText("브랜드");

      await user.type(input, "abcd");

      expect(input).toHaveValue("abc");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("maxLength가 없으면 글자수가 표시되지 않는다", () => {
      render(<Combobox label="브랜드" />);

      expect(screen.queryByText(/^\/\d+$/)).not.toBeInTheDocument();
    });
  });

  describe("접근성 속성", () => {
    it("helperText가 있으면 aria-describedby로 input과 연결된다", () => {
      render(<Combobox label="브랜드" helperText="도움말입니다" />);

      expect(screen.getByLabelText("브랜드")).toHaveAccessibleDescription("도움말입니다");
    });

    it("helperText가 없으면 aria-describedby 속성이 없다", () => {
      render(<Combobox label="브랜드" />);

      expect(screen.getByLabelText("브랜드")).not.toHaveAttribute("aria-describedby");
    });

    it("error면 aria-invalid가 true이다", () => {
      render(<Combobox label="브랜드" error />);

      expect(screen.getByLabelText("브랜드")).toHaveAttribute("aria-invalid", "true");
    });

    it("error를 생략하면 aria-invalid가 false이다", () => {
      render(<Combobox label="브랜드" />);

      expect(screen.getByLabelText("브랜드")).toHaveAttribute("aria-invalid", "false");
    });

    it("required면 input에 required 속성이 붙는다", () => {
      render(<Combobox label="브랜드" required />);

      expect(screen.getByLabelText("브랜드")).toBeRequired();
    });
  });

  describe("chips", () => {
    it("chips가 빈 배열이면 칩 그룹이 없다", () => {
      render(<Combobox label="브랜드" chips={[]} />);

      expect(screen.queryByRole("group")).not.toBeInTheDocument();
    });

    it("chips가 undefined면 칩 그룹이 없다", () => {
      render(<Combobox label="브랜드" />);

      expect(screen.queryByRole("group")).not.toBeInTheDocument();
    });

    it("selectedChipValue와 일치하는 칩만 aria-pressed가 true이다", () => {
      render(<Combobox label="브랜드" chips={CHIPS} selectedChipValue="naver" />);

      expect(screen.getByRole("button", { name: "네이버" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(screen.getByRole("button", { name: "카카오" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });

    it("칩을 클릭하면 onChipSelect가 해당 chip 객체로 호출된다", async () => {
      const handleChipSelect = vi.fn();
      const user = userEvent.setup();
      render(<Combobox label="브랜드" chips={CHIPS} onChipSelect={handleChipSelect} />);

      await user.click(screen.getByRole("button", { name: "네이버" }));

      expect(handleChipSelect).toHaveBeenCalledTimes(1);
      expect(handleChipSelect).toHaveBeenCalledWith(CHIPS[1]);
    });

    it("chipPosition을 생략하면 칩 그룹이 입력창 앞에 위치한다", () => {
      render(<Combobox label="브랜드" chips={CHIPS} />);

      const position = screen
        .getByRole("group")
        .compareDocumentPosition(screen.getByRole("textbox"));

      expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('chipPosition="bottom"이면 칩 그룹이 입력창 뒤에 위치한다', () => {
      render(<Combobox label="브랜드" chips={CHIPS} chipPosition="bottom" />);

      const position = screen
        .getByRole("group")
        .compareDocumentPosition(screen.getByRole("textbox"));

      expect(position & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
    });
  });
});
