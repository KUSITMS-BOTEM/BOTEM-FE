import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { pickWheelDate } from "@/__tests__/pickWheelDate";
import DateWheelSheet from "@/components/DateWheelSheet";

type Props = Partial<React.ComponentProps<typeof DateWheelSheet>>;

const setup = (props: Props = {}) => {
  const onSelect = vi.fn();
  const onClose = vi.fn();
  const view = render(
    <DateWheelSheet
      variant="deadline"
      open
      value=""
      onSelect={onSelect}
      onClose={onClose}
      {...props}
    />,
  );
  return { onSelect, onClose, user: userEvent.setup(), ...view };
};

describe("DateWheelSheet", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 13));
  });

  afterEach(() => vi.useRealTimers());

  it("deadline은 minDate 연도부터 2099년까지 보여준다", () => {
    setup();

    const years = screen.getAllByRole("button", { name: /년$/ }).map(button => button.textContent);

    expect(years[0]).toBe("2026년");
    expect(years.at(-1)).toBe("2099년");
    expect(years).toHaveLength(74);
  });

  it("확인을 누르면 고른 날짜로 onSelect가 호출되고 시트가 닫힌다", async () => {
    const { user, onSelect, onClose } = setup();

    await pickWheelDate(user, { year: 2028, month: 2, day: 29 });

    expect(onSelect).toHaveBeenCalledWith("2028-02-29");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("birth는 윤년 2월이라 29일까지 보여주고, 연도는 BIRTH_YEAR로 고정된다", async () => {
    const { user, onSelect } = setup({ variant: "birth" });

    await pickWheelDate(user, { month: 2, day: 29 });

    expect(onSelect).toHaveBeenCalledWith("2000-02-29");
  });

  it("minDate가 있는 첫 해에서 minDate 이전으로 월을 못 내리고, 연도를 올리면 모든 월이 열린다", async () => {
    const { user } = setup({ minDate: "2026-11-11" });

    expect(screen.queryByRole("button", { name: "10월" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "2027년" }));

    expect(screen.getByRole("button", { name: "1월" })).toBeInTheDocument();
  });

  it("다시 열면 고르던 값이 아니라 현재 value로 되돌아간다", async () => {
    const { user, rerender } = setup({ value: "2026-12-01" });
    await user.click(screen.getByRole("button", { name: "12월" }));
    await user.click(screen.getByRole("button", { name: "20일" }));

    const props = {
      variant: "deadline",
      value: "2026-12-01",
      onSelect: vi.fn(),
      onClose: vi.fn(),
    } as const;
    rerender(<DateWheelSheet {...props} open={false} />);
    rerender(<DateWheelSheet {...props} open />);

    expect(screen.getByRole("button", { name: "1일" })).toHaveAttribute("aria-pressed", "true");
  });
});
