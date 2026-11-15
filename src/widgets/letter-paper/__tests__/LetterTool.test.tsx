import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LetterTool, { type LetterToolType } from "@/widgets/letter-paper/LetterTool";
import type { Color } from "@/constants/color";

describe("LetterTool", () => {
  it.each<[LetterToolType, string]>([
    ["record", "녹음"],
    ["sticker", "스티커"],
    ["photo", "사진 추가"],
    ["letter", "편지지"],
  ])("type이 %s이면 '%s' 라벨의 버튼으로 접근된다", (type, label) => {
    render(<LetterTool type={type} color="pink" />);

    expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
  });

  it.each<Color>(["orange", "pink", "lime", "blue"])(
    "color가 %s이면 아이콘에 해당 색 클래스가 적용된다",
    color => {
      const { container } = render(<LetterTool type="record" color={color} />);

      expect(container.querySelector("svg")).toHaveClass(`text-base-${color}-500`);
    },
  );

  it("아이콘은 aria-hidden이라 접근 가능한 이름은 라벨뿐이다", () => {
    const { container } = render(<LetterTool type="photo" color="pink" />);

    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("button")).toHaveAccessibleName("사진 추가");
  });

  it("버튼 type은 button이라 form 안에서 submit되지 않는다", () => {
    render(<LetterTool type="record" color="pink" />);

    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("클릭하면 onClick이 1회 호출된다", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<LetterTool type="sticker" color="orange" onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: "스티커" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("onClick 없이 클릭해도 에러가 나지 않는다", async () => {
    const user = userEvent.setup();
    render(<LetterTool type="letter" color="lime" />);

    await expect(user.click(screen.getByRole("button", { name: "편지지" }))).resolves.not.toThrow();
  });

  it("className을 넘기면 기본 클래스를 유지한 채 병합된다", () => {
    render(<LetterTool type="record" color="pink" className="custom-class" />);

    expect(screen.getByRole("button")).toHaveClass("h-[72px]", "w-[61px]", "custom-class");
  });
});
