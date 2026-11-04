import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";

import BottomCTA from "@/components/BottomCTA";

const renderTwoButtons = (
  props: {
    direction?: "horizontal" | "vertical";
    upper?: ReactNode;
    lower?: ReactNode;
    className?: string;
  } = {},
) =>
  render(
    <BottomCTA {...props}>
      <button type="button">추가하기</button>
      <button type="button">자세히보기</button>
    </BottomCTA>,
  );

const getButtonArea = () => screen.getByRole("button", { name: "추가하기" }).parentElement!;

describe("BottomCTA", () => {
  it("children으로 넘긴 버튼들이 모두 노출된다", () => {
    renderTwoButtons();

    expect(screen.getByRole("button", { name: "추가하기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "자세히보기" })).toBeInTheDocument();
  });

  it("upper·lower를 넘기면 각각 버튼 영역 위·아래에 렌더된다", () => {
    renderTwoButtons({ upper: <span>위 항목</span>, lower: <span>아래 항목</span> });
    const buttonArea = getButtonArea();

    expect(buttonArea.previousElementSibling).toHaveTextContent("위 항목");
    expect(buttonArea.nextElementSibling).toHaveTextContent("아래 항목");
  });

  it("upper·lower를 넘기지 않으면 해당 영역 래퍼가 생기지 않는다", () => {
    renderTwoButtons();
    const buttonArea = getButtonArea();

    expect(buttonArea.previousElementSibling).toBeNull();
    expect(buttonArea.nextElementSibling).toBeNull();
  });

  it("direction 기본(horizontal)이면 버튼들이 균등 분할 클래스를 받는다", () => {
    renderTwoButtons();
    const buttonArea = getButtonArea();

    expect(buttonArea).toHaveClass("*:flex-1");
    expect(buttonArea).not.toHaveClass("flex-col");
  });

  it('direction="vertical"이면 세로 배치 클래스가 적용된다', () => {
    renderTwoButtons({ direction: "vertical" });
    const buttonArea = getButtonArea();

    expect(buttonArea).toHaveClass("flex-col", "*:w-full");
    expect(buttonArea).not.toHaveClass("*:flex-1");
  });

  it("type=\"kakao\"면 '카카오로 이용하기' 버튼이 노출되고 클릭 시 onClick이 호출된다", async () => {
    const onClick = vi.fn();
    render(<BottomCTA type="kakao" onClick={onClick} />);

    await userEvent.click(screen.getByRole("button", { name: "카카오로 이용하기" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('type="kakao" 버튼은 type이 button이라 폼 안에서 submit하지 않는다', () => {
    render(<BottomCTA type="kakao" onClick={() => {}} />);

    expect(screen.getByRole("button", { name: "카카오로 이용하기" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("className이 최상위 요소에 병합된다", () => {
    const { container } = renderTwoButtons({ className: "custom-class" });

    expect(container.firstElementChild).toHaveClass("custom-class", "fixed");
  });
});
