import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RecordButton from "@/widgets/letter-paper/RecordButton";
import type { Color } from "@/constants/color";

describe("RecordButton", () => {
  it("녹음 전에는 회색 배경과 흰 아이콘이고 color와 무관하다", () => {
    render(<RecordButton color="lime" />);

    const button = screen.getByRole("button", { name: "녹음 시작" });
    expect(button).toHaveClass("bg-semantic-text-quaternary", "text-semantic-icon-on-fill");
    expect(button).not.toHaveClass("bg-semantic-fill-lime");
  });

  it.each<[Color, string]>([
    ["orange", "bg-semantic-fill-brand"],
    ["pink", "bg-semantic-fill-pink"],
    ["lime", "bg-semantic-fill-lime"],
    ["blue", "bg-semantic-fill-blue"],
  ])("녹음 중이고 color가 %s이면 %s 배경이다", (color, bgClass) => {
    render(<RecordButton color={color} isRecording />);

    const button = screen.getByRole("button", { name: "녹음 중지" });
    expect(button).toHaveClass(bgClass);
    expect(button).not.toHaveClass("bg-semantic-text-quaternary");
  });

  it("녹음 중 lime만 아이콘이 검정이고 나머지는 흰색이다", () => {
    const { rerender } = render(<RecordButton color="lime" isRecording />);
    expect(screen.getByRole("button")).toHaveClass("text-semantic-text-strong");

    rerender(<RecordButton color="blue" isRecording />);
    expect(screen.getByRole("button")).toHaveClass("text-semantic-icon-on-fill");
  });

  it("클릭하면 onClick이 호출된다", async () => {
    const onClick = vi.fn();
    render(<RecordButton color="pink" onClick={onClick} />);

    await userEvent.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
