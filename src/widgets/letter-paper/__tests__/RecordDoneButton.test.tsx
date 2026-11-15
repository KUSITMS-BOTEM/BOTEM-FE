import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RecordDoneButton from "@/widgets/letter-paper/RecordDoneButton";
import type { Color } from "@/constants/color";

describe("RecordDoneButton", () => {
  it("text props가 버튼 이름으로 표시된다", () => {
    render(<RecordDoneButton text="녹음 완료" color="pink" />);

    expect(screen.getByRole("button", { name: "녹음 완료" })).toBeInTheDocument();
  });

  it.each<[Color, string]>([
    ["orange", "bg-semantic-fill-brand"],
    ["pink", "bg-semantic-fill-pink"],
    ["lime", "bg-semantic-fill-lime"],
    ["blue", "bg-semantic-fill-blue"],
  ])("color가 %s이면 %s 배경이 적용된다", (color, bg) => {
    render(<RecordDoneButton text="녹음 완료" color={color} />);

    expect(screen.getByRole("button")).toHaveClass(bg);
  });

  it("lime만 글자색이 검정 토큰이고 나머지는 흰색 토큰이다", () => {
    const { rerender } = render(<RecordDoneButton text="녹음 완료" color="lime" />);
    expect(screen.getByRole("button")).toHaveClass("text-semantic-text-strong");

    rerender(<RecordDoneButton text="녹음 완료" color="blue" />);
    expect(screen.getByRole("button")).toHaveClass("text-semantic-text-on-fill");
  });

  it("아이콘은 aria-hidden이라 접근 가능한 이름은 text뿐이다", () => {
    const { container } = render(<RecordDoneButton text="녹음 완료" color="pink" />);

    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("버튼 type은 button이다", () => {
    render(<RecordDoneButton text="녹음 완료" color="pink" />);

    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("클릭하면 onClick이 호출된다", async () => {
    const onClick = vi.fn();
    render(<RecordDoneButton text="녹음 완료" color="pink" onClick={onClick} />);

    await userEvent.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
