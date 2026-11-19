import { render, screen } from "@testing-library/react";

import ListText from "@/components/ListText";

const getLines = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("p")).map(p => p.textContent);

describe("ListText", () => {
  it("description이 없으면 타이틀 한 줄만 렌더된다", () => {
    const { container } = render(<ListText title="타이틀" />);

    expect(getLines(container)).toEqual(["타이틀"]);
  });

  it("기본은 타이틀 다음에 설명이 온다", () => {
    const { container } = render(<ListText title="타이틀" description="설명" />);

    expect(getLines(container)).toEqual(["타이틀", "설명"]);
  });

  it("titleUp이면 설명 다음에 타이틀이 온다", () => {
    const { container } = render(<ListText title="타이틀" description="설명" titleUp />);

    expect(getLines(container)).toEqual(["설명", "타이틀"]);
  });

  it("description이 빈 문자열이면 설명 줄이 렌더되지 않는다", () => {
    const { container } = render(<ListText title="타이틀" description="" />);

    expect(getLines(container)).toEqual(["타이틀"]);
  });

  it.each([
    [undefined, "[font:var(--semantic-label-medium)]"],
    ["price", "[font:var(--semantic-label-large)]"],
  ] as const)("type=%s면 타이틀에 %s 폰트가 적용된다", (type, expected) => {
    render(<ListText title="타이틀" type={type} />);

    expect(screen.getByText("타이틀")).toHaveClass(expected);
  });

  it("description에 개행이 있으면 줄바꿈이 그대로 유지되고 whitespace-pre-line 클래스가 적용된다", () => {
    const { container } = render(<ListText title="타이틀" description={"첫줄\n둘째줄"} />);
    const descriptionEl = container.querySelectorAll("p")[1];

    expect(descriptionEl).toHaveClass("whitespace-pre-line");
    expect(descriptionEl.textContent).toBe("첫줄\n둘째줄");
  });

  it("align=right면 text-right 클래스가 붙는다", () => {
    const { container } = render(<ListText title="타이틀" align="right" />);

    expect(container.firstChild).toHaveClass("text-right");
  });

  it("caption이 있으면 세 번째 줄로 tertiary 색·subtext-small 폰트로 렌더된다", () => {
    const { container } = render(<ListText title="타이틀" description="설명" caption="캡션" />);

    expect(getLines(container)).toEqual(["타이틀", "설명", "캡션"]);
    expect(screen.getByText("캡션")).toHaveClass(
      "text-semantic-text-tertiary",
      "[font:var(--semantic-subtext-small)]",
    );
  });

  it("caption이 빈 문자열이면 캡션 줄이 렌더되지 않는다", () => {
    const { container } = render(<ListText title="타이틀" description="설명" caption="" />);

    expect(getLines(container)).toEqual(["타이틀", "설명"]);
  });

  describe("size", () => {
    it("small이면 작은 폰트를 쓰고 타이틀 줄바꿈을 허용한다", () => {
      const { container } = render(
        <ListText title={"첫 줄\n둘째 줄"} description="설명" size="small" />,
      );

      expect(screen.getByText(/첫 줄/)).toHaveClass(
        "[font:var(--semantic-label-small)]",
        "whitespace-pre-line",
      );
      expect(screen.getByText("설명")).toHaveClass("[font:var(--semantic-subtext-medium)]");
      expect(container.firstElementChild).not.toHaveClass("[&>p:first-child]:whitespace-nowrap");
    });

    it("기본(medium)은 기존 폰트와 타이틀 한 줄 고정을 유지한다", () => {
      const { container } = render(<ListText title="타이틀" description="설명" />);

      expect(screen.getByText("타이틀")).toHaveClass("[font:var(--semantic-label-medium)]");
      expect(screen.getByText("설명")).toHaveClass("[font:var(--semantic-subtext-large)]");
      expect(container.firstElementChild).toHaveClass("[&>p:first-child]:whitespace-nowrap");
    });
  });
});
