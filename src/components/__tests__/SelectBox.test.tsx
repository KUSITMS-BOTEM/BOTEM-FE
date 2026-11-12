import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { mockPointer } from "@/__tests__/mockPointer";
import SelectBox from "@/components/SelectBox";

describe("SelectBox", () => {
  it("버튼의 접근 가능한 이름이 레이블과 값으로 묶인다", () => {
    render(<SelectBox label="지역" value="서울" />);

    expect(screen.getByRole("button", { name: "지역 서울" })).toBeInTheDocument();
  });

  it("value가 있으면 값이 primary 색으로 표시된다", () => {
    render(<SelectBox label="지역" value="서울" />);

    expect(screen.getByText("서울")).toHaveClass("text-semantic-text-primary");
  });

  it("value가 없으면 기본 placeholder가 quaternary 색으로 표시된다", () => {
    render(<SelectBox label="지역" />);

    expect(screen.getByText("선택해주세요")).toHaveClass("text-semantic-text-quaternary");
  });

  it("variant가 birth면 select와 다른 아이콘이 표시된다", () => {
    const { container: selectBox } = render(<SelectBox label="지역" />);
    const { container: birthBox } = render(<SelectBox variant="birth" label="생년월일" />);

    expect(birthBox.querySelector("svg")?.innerHTML).not.toBe(
      selectBox.querySelector("svg")?.innerHTML,
    );
  });

  it("빈 문자열 value는 비어 있는 것으로 보고 placeholder를 표시한다", () => {
    render(<SelectBox label="지역" value="" />);

    expect(screen.getByText("선택해주세요")).toHaveClass("text-semantic-text-quaternary");
  });

  it("placeholder를 지정하면 기본 문구 대신 지정한 문구가 표시된다", () => {
    render(<SelectBox label="지역" placeholder="지역을 골라주세요" />);

    expect(screen.getByText("지역을 골라주세요")).toBeInTheDocument();
    expect(screen.queryByText("선택해주세요")).not.toBeInTheDocument();
  });

  it("value가 있으면 placeholder는 표시되지 않는다", () => {
    render(<SelectBox label="지역" value="서울" placeholder="지역을 골라주세요" />);

    expect(screen.queryByText("지역을 골라주세요")).not.toBeInTheDocument();
  });

  it("type 기본값은 button이다", () => {
    render(<SelectBox label="지역" />);

    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("type을 넘기면 기본값을 덮어쓴다", () => {
    render(<SelectBox label="지역" type="submit" />);

    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("클릭하면 onClick이 1회 호출된다", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<SelectBox label="지역" onClick={handleClick} />);

    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disabled이면 클릭해도 onClick이 호출되지 않는다", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<SelectBox label="지역" disabled onClick={handleClick} />);

    await user.click(screen.getByRole("button"));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("helperText가 있으면 안내 문구가 렌더되고 aria-describedby로 연결된다", () => {
    render(<SelectBox label="지역" helperText="거주 지역을 선택해주세요" />);

    expect(screen.getByRole("button")).toHaveAccessibleDescription("거주 지역을 선택해주세요");
  });

  it("helperText가 없으면 aria-describedby가 없다", () => {
    render(<SelectBox label="지역" />);

    expect(screen.getByRole("button")).not.toHaveAttribute("aria-describedby");
  });

  it("helperText가 빈 문자열이어도 aria-describedby가 연결된다", () => {
    render(<SelectBox label="지역" id="region" helperText="" />);

    expect(screen.getByRole("button")).toHaveAttribute("aria-describedby", "region-help");
  });

  it("id를 지정하면 버튼 id와 aria 연결 id가 그 id를 기준으로 만들어진다", () => {
    render(<SelectBox label="지역" id="region" helperText="도움말" />);
    const button = screen.getByRole("button");

    expect(button).toHaveAttribute("id", "region");
    expect(button).toHaveAttribute("aria-labelledby", "region-label region-value");
    expect(button).toHaveAttribute("aria-describedby", "region-help");
  });

  it("className은 래퍼에 기존 클래스와 함께 적용된다", () => {
    render(<SelectBox label="지역" className="mt-4" />);
    const wrapper = screen.getByRole("button").parentElement;

    expect(wrapper).toHaveClass("mt-4", "w-full");
  });

  describe("variant=deadline (터치 기기)", () => {
    beforeEach(() => mockPointer("coarse"));

    it("날짜를 선택하면 onDeadlineChange가 연도를 포함한 날짜로 호출되고 onDateChange는 호출되지 않는다", () => {
      const handleDeadlineChange = vi.fn();
      const handleDateChange = vi.fn();
      const { container } = render(
        <SelectBox
          variant="deadline"
          label="마감일"
          onDeadlineChange={handleDeadlineChange}
          onDateChange={handleDateChange}
        />,
      );

      fireEvent.change(container.querySelector('input[type="date"]')!, {
        target: { value: "2026-12-25" },
      });

      expect(handleDeadlineChange).toHaveBeenCalledWith("2026-12-25");
      expect(handleDateChange).not.toHaveBeenCalled();
    });

    it("minDate를 넘기면 날짜 input의 min으로 전달된다", () => {
      const { container } = render(
        <SelectBox variant="deadline" label="마감일" minDate="2026-11-11" />,
      );

      expect(container.querySelector('input[type="date"]')).toHaveAttribute("min", "2026-11-11");
    });

    it("날짜를 지우면 onDeadlineChange가 빈 문자열로 호출된다", () => {
      const handleDeadlineChange = vi.fn();
      const { container } = render(
        <SelectBox variant="deadline" label="마감일" onDeadlineChange={handleDeadlineChange} />,
      );
      const dateInput = container.querySelector('input[type="date"]')!;

      fireEvent.change(dateInput, { target: { value: "2026-12-25" } });
      fireEvent.change(dateInput, { target: { value: "" } });

      expect(handleDeadlineChange).toHaveBeenLastCalledWith("");
    });
  });

  describe("variant=birth (터치 기기)", () => {
    beforeEach(() => mockPointer("coarse"));

    it("날짜를 선택하면 onDateChange가 월·일로 호출된다", () => {
      const handleDateChange = vi.fn();
      const { container } = render(
        <SelectBox variant="birth" label="생일" onDateChange={handleDateChange} />,
      );
      const dateInput = container.querySelector('input[type="date"]')!;

      fireEvent.change(dateInput, { target: { value: "2000-03-15" } });

      expect(handleDateChange).toHaveBeenCalledWith(3, 15);
    });

    it("날짜를 지우면 onDateChange가 (null, null)로 호출된다", () => {
      const handleDateChange = vi.fn();
      const { container } = render(
        <SelectBox variant="birth" label="생일" onDateChange={handleDateChange} />,
      );
      const dateInput = container.querySelector('input[type="date"]')!;

      fireEvent.change(dateInput, { target: { value: "2000-03-15" } });
      fireEvent.change(dateInput, { target: { value: "" } });

      expect(handleDateChange).toHaveBeenLastCalledWith(null, null);
    });

    it("onDeadlineChange는 호출되지 않는다", () => {
      const handleDeadlineChange = vi.fn();
      const { container } = render(
        <SelectBox variant="birth" label="생일" onDeadlineChange={handleDeadlineChange} />,
      );

      fireEvent.change(container.querySelector('input[type="date"]')!, {
        target: { value: "2000-03-15" },
      });

      expect(handleDeadlineChange).not.toHaveBeenCalled();
    });

    it("나머지 props는 감싸는 영역에 그대로 전달된다", () => {
      const { container } = render(
        <SelectBox variant="birth" label="생일" aria-label="생일 영역" />,
      );

      expect(container.querySelector('[aria-label="생일 영역"]')).not.toBeNull();
    });
  });

  describe("날짜 variant (마우스 환경)", () => {
    beforeEach(() => {
      mockPointer("fine");
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(new Date(2026, 10, 13));
    });

    afterEach(() => vi.useRealTimers());

    it("네이티브 date input 없이 아이콘 버튼으로 달력을 연다", async () => {
      const user = userEvent.setup();
      const { container } = render(<SelectBox variant="deadline" label="마감일" />);

      expect(container.querySelector('input[type="date"]')).toBeNull();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "마감일 선택해주세요" }));

      expect(screen.getByRole("dialog", { name: "마감일 선택" })).toBeInTheDocument();
    });

    it("deadline은 날짜를 고르면 연도를 포함한 날짜로 onDeadlineChange가 호출되고 달력이 닫힌다", async () => {
      const handleDeadlineChange = vi.fn();
      const handleDateChange = vi.fn();
      const user = userEvent.setup();
      render(
        <SelectBox
          variant="deadline"
          label="마감일"
          onDeadlineChange={handleDeadlineChange}
          onDateChange={handleDateChange}
        />,
      );

      await user.click(screen.getByRole("button", { name: "마감일 선택해주세요" }));
      await user.click(screen.getByRole("button", { name: /11월 20일/ }));

      expect(handleDeadlineChange).toHaveBeenCalledWith("2026-11-20");
      expect(handleDateChange).not.toHaveBeenCalled();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("deadline은 오늘 이전 날짜를 선택할 수 없고 오늘은 선택할 수 있다", async () => {
      const user = userEvent.setup();
      render(<SelectBox variant="deadline" label="마감일" />);

      await user.click(screen.getByRole("button", { name: "마감일 선택해주세요" }));

      expect(screen.getByRole("button", { name: /11월 12일/ })).toBeDisabled();
      expect(screen.getByRole("button", { name: /11월 13일/ })).toBeEnabled();
    });

    it("minDate가 있으면 오늘이 아니라 minDate 이전 날짜를 선택할 수 없다", async () => {
      const user = userEvent.setup();
      render(<SelectBox variant="deadline" label="마감일" minDate="2026-11-20" />);

      await user.click(screen.getByRole("button", { name: "마감일 선택해주세요" }));

      expect(screen.getByRole("button", { name: /11월 19일/ })).toBeDisabled();
      expect(screen.getByRole("button", { name: /11월 20일/ })).toBeEnabled();
    });

    it("birth는 고른 날짜의 월·일로 onDateChange가 호출된다", async () => {
      const handleDateChange = vi.fn();
      const handleDeadlineChange = vi.fn();
      const user = userEvent.setup();
      render(
        <SelectBox
          variant="birth"
          label="생일"
          onDateChange={handleDateChange}
          onDeadlineChange={handleDeadlineChange}
        />,
      );

      await user.click(screen.getByRole("button", { name: "생일 선택해주세요" }));
      await user.click(screen.getByRole("button", { name: /11월 20일/ }));

      expect(handleDateChange).toHaveBeenCalledWith(11, 20);
      expect(handleDeadlineChange).not.toHaveBeenCalled();
    });

    it("birth는 dateValue(MM-DD)의 월·일이 선택된 상태로 달력이 열린다", async () => {
      const user = userEvent.setup();
      render(<SelectBox variant="birth" label="생일" value="10월 13일" dateValue="10-13" />);

      await user.click(screen.getByRole("button", { name: "생일 10월 13일" }));

      expect(screen.getByText("10월")).toBeInTheDocument();
      expect(screen.getByRole("gridcell", { selected: true })).toHaveTextContent("13");
    });

    it("dateValue가 마운트 뒤에 도착해도 아직 고르지 않았다면 달력에 반영된다", async () => {
      const user = userEvent.setup();
      const { rerender } = render(<SelectBox variant="birth" label="생일" dateValue="" />);

      rerender(<SelectBox variant="birth" label="생일" value="10월 13일" dateValue="10-13" />);
      await user.click(screen.getByRole("button", { name: "생일 10월 13일" }));

      expect(screen.getByRole("gridcell", { selected: true })).toHaveTextContent("13");
    });

    it("birth는 연도 없이 월만 보여주고 2월 29일도 고를 수 있다", async () => {
      const handleDateChange = vi.fn();
      const user = userEvent.setup();
      render(<SelectBox variant="birth" label="생일" onDateChange={handleDateChange} />);

      await user.click(screen.getByRole("button", { name: "생일 선택해주세요" }));
      expect(screen.getByText("11월")).toBeInTheDocument();

      for (let i = 0; i < 9; i++) {
        await user.click(screen.getByRole("button", { name: /이전/ }));
      }
      await user.click(screen.getByRole("button", { name: /2월 29일/ }));

      expect(handleDateChange).toHaveBeenCalledWith(2, 29);
    });

    it("birth는 12월에서 더 다음 달로 넘어갈 수 없다", async () => {
      const user = userEvent.setup();
      render(<SelectBox variant="birth" label="생일" />);

      await user.click(screen.getByRole("button", { name: "생일 선택해주세요" }));
      await user.click(screen.getByRole("button", { name: /다음/ }));

      expect(screen.getByText("12월")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /다음/ })).toHaveAttribute("aria-disabled", "true");
    });

    it("Esc를 누르거나 바깥을 누르면 값 변경 없이 달력이 닫힌다", async () => {
      const handleDeadlineChange = vi.fn();
      const user = userEvent.setup();
      render(
        <SelectBox variant="deadline" label="마감일" onDeadlineChange={handleDeadlineChange} />,
      );

      await user.click(screen.getByRole("button", { name: "마감일 선택해주세요" }));
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "마감일 선택해주세요" }));
      await user.click(document.body);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(handleDeadlineChange).not.toHaveBeenCalled();
    });

    it("disabled이면 달력을 열 수 없다", async () => {
      const user = userEvent.setup();
      render(<SelectBox variant="deadline" label="마감일" disabled />);

      await user.click(screen.getByRole("button", { name: "마감일 선택해주세요" }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
