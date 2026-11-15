import { render, screen } from "@testing-library/react";

import NameChip from "@/widgets/letter-paper/NameChip";
import type { Color } from "@/constants/color";

describe("NameChip", () => {
  it("name props가 텍스트로 표시된다", () => {
    render(<NameChip name="김보탬" />);

    expect(screen.getByText("김보탬")).toBeInTheDocument();
  });

  it.each<[Color, string, string]>([
    ["orange", "bg-semantic-fill-brand-weak", "text-semantic-fill-brand"],
    ["pink", "bg-semantic-fill-pink-weak", "text-semantic-fill-pink"],
    ["lime", "bg-semantic-fill-lime", "text-semantic-text-strong"],
    ["blue", "bg-semantic-fill-blue-weak", "text-semantic-fill-blue"],
  ])("color가 %s이면 %s 배경과 %s 글자색이 적용된다", (color, bg, text) => {
    render(<NameChip name="이름" color={color} />);

    expect(screen.getByText("이름")).toHaveClass(bg, text);
  });

  it("color를 생략하면 orange로 표시된다", () => {
    render(<NameChip name="이름" />);

    expect(screen.getByText("이름")).toHaveClass("bg-semantic-fill-brand-weak");
  });

  it("className이 기본 클래스와 병합된다", () => {
    render(<NameChip name="이름" className="custom-class" />);

    expect(screen.getByText("이름")).toHaveClass("custom-class", "rounded-full");
  });
});
