import { type ComponentProps } from "react";
import { render, screen } from "@testing-library/react";

import Badge from "@/components/Badge";

describe("Badge", () => {
  it("label 텍스트가 span 안에 렌더된다", () => {
    render(<Badge label="뱃지" />);

    expect(screen.getByText("뱃지").tagName).toBe("SPAN");
  });

  it("props를 생략하면 neutral·fill·small 스타일이 적용된다", () => {
    render(<Badge label="뱃지" />);
    const badge = screen.getByText("뱃지");

    expect(badge).toHaveClass(
      "bg-semantic-fill-neutral",
      "text-semantic-text-on-fill",
      "[font:var(--semantic-label-x-small)]",
    );
  });

  it.each([
    ["neutral", "fill", "bg-semantic-fill-neutral", "text-semantic-text-on-fill"],
    ["neutral", "weak", "bg-semantic-fill-neutral-weak", "text-semantic-text-primary"],
    ["ghost", undefined, "bg-semantic-fill-default", "text-semantic-text-primary"],
    ["brand", "fill", "bg-semantic-fill-brand", "text-semantic-text-on-fill"],
    ["brand", "weak", "bg-semantic-fill-brand-weak", "text-semantic-text-brand"],
    ["danger", "fill", "bg-semantic-fill-danger", "text-semantic-text-on-fill"],
    ["danger", "weak", "bg-semantic-fill-danger-weak", "text-semantic-text-danger"],
  ] as const)(
    "color=%s, variant=%s 조합이면 %s·%s 클래스가 적용된다",
    (color, variant, backgroundClass, textClass) => {
      const props = { label: "뱃지", color, variant } as ComponentProps<typeof Badge>;
      render(<Badge {...props} />);

      expect(screen.getByText("뱃지")).toHaveClass(backgroundClass, textClass);
    },
  );

  it('size="medium"이면 label-small 폰트가 적용되고 label-x-small은 없다', () => {
    render(<Badge label="뱃지" size="medium" />);
    const badge = screen.getByText("뱃지");

    expect(badge.className).toContain("[font:var(--semantic-label-small)]");
    expect(badge.className).not.toContain("[font:var(--semantic-label-x-small)]");
  });

  it("className이 기본 클래스와 함께 병합된다", () => {
    render(<Badge label="뱃지" className="mt-4" />);
    const badge = screen.getByText("뱃지");

    expect(badge.className).toContain("mt-4");
    expect(badge.className).toContain("inline-flex");
  });

  it("aria-label·data-* 속성이 span으로 전달된다", () => {
    render(<Badge label="뱃지" aria-label="상태 뱃지" data-testid="badge" data-kind="status" />);
    const badge = screen.getByTestId("badge");

    expect(badge.tagName).toBe("SPAN");
    expect(badge).toHaveAttribute("aria-label", "상태 뱃지");
    expect(badge).toHaveAttribute("data-kind", "status");
  });
});
