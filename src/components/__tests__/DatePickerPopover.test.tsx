import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DatePickerPopover from "@/components/DatePickerPopover";

type Props = Partial<React.ComponentProps<typeof DatePickerPopover>>;

const setup = (props: Props = {}) => {
  const onSelect = vi.fn();
  const user = userEvent.setup();
  render(
    <DatePickerPopover
      variant="deadline"
      value=""
      onSelect={onSelect}
      triggerProps={{ id: "date", "aria-labelledby": "date-label" }}
      {...props}>
      아이콘
    </DatePickerPopover>,
  );
  return { onSelect, user, trigger: screen.getByRole("button", { name: "아이콘" }) };
};

describe("DatePickerPopover", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 13));
  });

  afterEach(() => vi.useRealTimers());

  it("닫힌 상태에선 달력이 없고, 트리거를 누르면 열리며 aria-expanded가 바뀐다", async () => {
    const { user, trigger } = setup();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("열린 상태에서 트리거를 다시 누르면 닫힌다", async () => {
    const { user, trigger } = setup();

    await user.click(trigger);
    await user.click(trigger);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("deadline은 value의 날짜가 선택된 상태로 열린다", async () => {
    const { user, trigger } = setup({ value: "2026-11-20" });

    await user.click(trigger);

    expect(screen.getByRole("gridcell", { selected: true })).toHaveTextContent("20");
  });

  it("birth는 value의 연도가 달라도 같은 월·일이 선택된 채 해당 월로 열린다", async () => {
    const { user, trigger } = setup({ variant: "birth", value: "1999-03-15" });

    await user.click(trigger);

    expect(screen.getByText("3월")).toBeInTheDocument();
    expect(screen.getByRole("gridcell", { selected: true })).toHaveTextContent("15");
  });

  it("deadline은 날짜를 고르면 onSelect가 YYYY-MM-DD로 호출되고 닫힌다", async () => {
    const { onSelect, user, trigger } = setup();

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: /11월 20일/ }));

    expect(onSelect).toHaveBeenCalledWith("2026-11-20");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("birth는 날짜를 고르면 onSelect가 2000-MM-DD로 호출된다", async () => {
    const { onSelect, user, trigger } = setup({ variant: "birth" });

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: /11월 15일/ }));

    expect(onSelect).toHaveBeenCalledWith("2000-11-15");
  });

  it("deadline은 value가 없으면 오늘이 선택된 상태로 열린다", async () => {
    const { user, trigger } = setup();

    await user.click(trigger);

    expect(screen.getByRole("gridcell", { selected: true })).toHaveTextContent("13");
    expect(screen.getByText("2026년 11월")).toBeInTheDocument();
  });

  it("birth는 value가 없으면 오늘의 월·일이 선택된 상태로 열린다", async () => {
    const { user, trigger } = setup({ variant: "birth" });

    await user.click(trigger);

    expect(screen.getByText("11월")).toBeInTheDocument();
    expect(screen.getByRole("gridcell", { selected: true })).toHaveTextContent("13");
  });

  it("minDate가 오늘보다 늦고 value가 없으면 minDate가 선택된 상태로 열린다", async () => {
    const { user, trigger } = setup({ minDate: "2026-12-05" });

    await user.click(trigger);

    expect(screen.getByText("2026년 12월")).toBeInTheDocument();
    expect(screen.getByRole("gridcell", { selected: true })).toHaveTextContent("5");
  });

  describe("disableBeforeSelected", () => {
    it("value가 있으면 그 날짜 이전은 선택할 수 없고 그 날짜와 이후는 선택할 수 있다", async () => {
      const { user, trigger } = setup({ value: "2026-11-20", disableBeforeSelected: true });

      await user.click(trigger);

      expect(screen.getByRole("button", { name: /11월 19일/ })).toBeDisabled();
      expect(screen.getByRole("button", { name: /11월 20일/ })).toBeEnabled();
      expect(screen.getByRole("button", { name: /11월 21일/ })).toBeEnabled();
    });

    it("value가 없으면 오늘 이전은 선택할 수 없다", async () => {
      const { user, trigger } = setup({ disableBeforeSelected: true });

      await user.click(trigger);

      expect(screen.getByRole("button", { name: /11월 12일/ })).toBeDisabled();
      expect(screen.getByRole("button", { name: /11월 13일/ })).toBeEnabled();
    });

    it("birth에서도 선택된 월·일 이전은 선택할 수 없다", async () => {
      const { user, trigger } = setup({
        variant: "birth",
        value: "1999-03-15",
        disableBeforeSelected: true,
      });

      await user.click(trigger);

      expect(screen.getByRole("button", { name: /3월 14일/ })).toBeDisabled();
      expect(screen.getByRole("button", { name: /3월 15일/ })).toBeEnabled();
    });

    it("지정하지 않으면 선택된 날짜 이전도 선택할 수 있다 (birth)", async () => {
      const { user, trigger } = setup({ variant: "birth", value: "1999-03-15" });

      await user.click(trigger);

      expect(screen.getByRole("button", { name: /3월 14일/ })).toBeEnabled();
    });
  });

  it("disabled면 트리거를 눌러도 열리지 않는다", async () => {
    const { user, trigger } = setup({ disabled: true });

    await user.click(trigger);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("triggerProps가 트리거 버튼에 전달된다", () => {
    const { trigger } = setup();

    expect(trigger).toHaveAttribute("id", "date");
    expect(trigger).toHaveAttribute("aria-labelledby", "date-label");
  });
});
