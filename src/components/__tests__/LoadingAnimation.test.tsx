import { render } from "@testing-library/react";

import LoadingAnimation from "@/components/LoadingAnimation";

function getDots(container: HTMLElement) {
  return Array.from(container.firstElementChild?.children ?? []);
}

describe("LoadingAnimation", () => {
  it("props 없이 렌더하면 기본값(large, black)에 해당하는 클래스가 적용된다", () => {
    const { container } = render(<LoadingAnimation />);
    const [firstDot] = getDots(container);

    expect(firstDot.className).toContain("size-2.5");
    expect(firstDot.className).toContain("bg-semantic-fill-neutral");
  });

  it('size="small"이면 small 전용 dot 크기 클래스가 적용된다', () => {
    const { container } = render(<LoadingAnimation size="small" />);
    const [firstDot] = getDots(container);

    expect(firstDot.className).toContain("size-2");
    expect(firstDot.className).not.toContain("size-2.5");
  });

  it.each([
    ["white", "bg-semantic-icon-on-fill"],
    ["brand", "bg-semantic-fill-brand"],
    ["danger", "bg-semantic-fill-danger"],
  ] as const)('color="%s"이면 %s 클래스가 적용된다', (color, expectedClass) => {
    const { container } = render(<LoadingAnimation color={color} />);
    const [firstDot] = getDots(container);

    expect(firstDot.className).toContain(expectedClass);
  });

  it("className prop을 전달하면 루트 요소 class에 포함된다", () => {
    const { container } = render(<LoadingAnimation className="mt-4" />);

    expect(container.firstElementChild?.className).toContain("mt-4");
  });

  it("className을 생략해도 에러 없이 정상 렌더된다", () => {
    expect(() => render(<LoadingAnimation />)).not.toThrow();
  });

  it("첫 번째 dot만 큰 사이즈이고, 세 dot은 각각 다른 stagger delay를 갖는다", () => {
    const { container } = render(<LoadingAnimation />);
    const [first, second, third] = getDots(container);

    expect(first.className).toContain("size-2.5");
    expect(second.className).toContain("size-2");
    expect(third.className).toContain("size-2");

    expect(first.className).not.toContain("animation-delay");
    expect(second.className).toContain("[animation-delay:0.2s]");
    expect(third.className).toContain("[animation-delay:0.4s]");
  });
});
