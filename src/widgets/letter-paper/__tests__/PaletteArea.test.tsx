import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PaletteArea from "@/widgets/letter-paper/PaletteArea";
import type { Color } from "@/constants/color";

const SWATCH_LABEL: Record<Color, string> = {
  orange: "주황",
  lime: "라임",
  pink: "핑크",
  blue: "파랑",
};

describe("PaletteArea", () => {
  it("스와치 4개가 라디오로 렌더되고 color와 일치하는 것만 선택 상태다", () => {
    render(<PaletteArea color="pink" />);

    expect(screen.getAllByRole("radio")).toHaveLength(4);
    expect(screen.getByRole("radio", { name: "핑크" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "주황" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "라임" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "파랑" })).not.toBeChecked();
  });

  it.each<[Color, string]>([
    ["orange", "border-base-orange-900"],
    ["lime", "border-base-lime-900"],
    ["pink", "border-base-pink-900"],
    ["blue", "border-base-blue-900"],
  ])("color가 %s이면 해당 스와치에만 %s 링이 붙는다", (color, ringClass) => {
    render(<PaletteArea color={color} />);

    expect(screen.getByRole("radio", { name: SWATCH_LABEL[color] })).toHaveClass(ringClass);
    expect(
      screen.getAllByRole("radio").filter(radio => radio.className.includes("border-base-")),
    ).toHaveLength(1);
  });

  it("스와치를 클릭하면 onColorChange가 해당 색으로 호출된다", async () => {
    const onColorChange = vi.fn();
    render(<PaletteArea color="orange" onColorChange={onColorChange} />);

    await userEvent.click(screen.getByRole("radio", { name: "파랑" }));

    expect(onColorChange).toHaveBeenCalledTimes(1);
    expect(onColorChange).toHaveBeenCalledWith("blue");
  });

  it("onColorChange 없이도 클릭한 스와치로 선택(링)이 옮겨간다", async () => {
    render(<PaletteArea color="orange" />);

    await userEvent.click(screen.getByRole("radio", { name: "라임" }));

    expect(screen.getByRole("radio", { name: "라임" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "라임" })).toHaveClass("border-base-lime-900");
    expect(screen.getByRole("radio", { name: "주황" })).not.toBeChecked();
  });

  it("부모가 color를 바꾸면 선택도 따라간다", () => {
    const { rerender } = render(<PaletteArea color="orange" />);

    rerender(<PaletteArea color="blue" />);

    expect(screen.getByRole("radio", { name: "파랑" })).toBeChecked();
  });

  it("플러스 버튼을 클릭하면 onAddClick이 호출된다", async () => {
    const onAddClick = vi.fn();
    render(<PaletteArea color="orange" onAddClick={onAddClick} />);

    await userEvent.click(screen.getByRole("button", { name: "나만의 편지 만들기" }));

    expect(onAddClick).toHaveBeenCalledTimes(1);
  });

  it("툴팁은 기본으로 보이고 tooltip이 false면 숨겨진다", () => {
    const { rerender } = render(<PaletteArea color="orange" />);
    expect(screen.getByRole("tooltip")).toHaveTextContent("나만의 편지를 만들어 볼까요?");

    rerender(<PaletteArea color="orange" tooltip={false} />);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("루트는 기본으로 w-full이고 className이 병합된다", () => {
    const { container } = render(<PaletteArea color="orange" className="bg-red-500" />);

    expect(container.firstElementChild).toHaveClass("w-full", "bg-red-500");
  });
});
