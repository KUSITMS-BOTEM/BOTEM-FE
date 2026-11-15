import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PlayButton from "@/widgets/letter-paper/PlayButton";
import type { Color } from "@/constants/color";

describe("PlayButton", () => {
  it("기본은 재생 상태라 '재생' 버튼이다", () => {
    render(<PlayButton color="pink" />);

    expect(screen.getByRole("button", { name: "재생" })).toBeInTheDocument();
  });

  it("isPlaying이면 '일시정지' 버튼이다", () => {
    render(<PlayButton color="pink" isPlaying />);

    expect(screen.getByRole("button", { name: "일시정지" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "재생" })).not.toBeInTheDocument();
  });

  it.each<[Color, string]>([
    ["orange", "text-base-orange-500"],
    ["pink", "text-base-pink-500"],
    ["lime", "text-base-lime-500"],
    ["blue", "text-base-blue-500"],
  ])("color가 %s이면 %s 클래스를 가진다", (color, textClass) => {
    render(<PlayButton color={color} />);

    expect(screen.getByRole("button")).toHaveClass(textClass);
  });

  it("클릭하면 onClick이 호출된다", async () => {
    const onClick = vi.fn();
    render(<PlayButton color="blue" onClick={onClick} />);

    await userEvent.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("className을 병합한다", () => {
    render(<PlayButton color="lime" className="ml-2" />);

    expect(screen.getByRole("button")).toHaveClass("ml-2", "size-7.5");
  });
});
