import { type ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Button from "@/components/Button";

describe("Button", () => {
  it("children이 버튼 텍스트로 렌더된다", () => {
    render(<Button>제출</Button>);

    expect(screen.getByRole("button", { name: "제출" })).toBeInTheDocument();
  });

  it("네이티브 onClick이 전달되어 클릭 시 호출된다", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>제출</Button>);

    await user.click(screen.getByRole("button", { name: "제출" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it.each([
    [
      "neutral fill",
      <Button key="1" color="neutral" variant="fill">
        버튼
      </Button>,
      "bg-semantic-fill-neutral",
      "text-semantic-text-on-fill",
    ],
    [
      "neutral weak",
      <Button key="2" color="neutral" variant="weak">
        버튼
      </Button>,
      "bg-semantic-fill-neutral-weak",
      "text-semantic-text-primary",
    ],
    [
      "neutral ghost",
      <Button key="3" color="neutral" variant="ghost">
        버튼
      </Button>,
      "bg-semantic-fill-default",
      "text-semantic-text-primary",
    ],
    [
      "neutral stroke",
      <Button key="4" color="neutral" variant="stroke">
        버튼
      </Button>,
      "border-semantic-border-default",
      "text-semantic-text-primary",
    ],
    [
      "brand fill",
      <Button key="5" color="brand" variant="fill">
        버튼
      </Button>,
      "bg-semantic-fill-brand",
      "text-semantic-text-on-fill",
    ],
    [
      "brand weak",
      <Button key="6" color="brand" variant="weak">
        버튼
      </Button>,
      "bg-semantic-fill-brand-weak",
      "text-semantic-text-brand",
    ],
    [
      "danger fill",
      <Button key="7" color="danger" variant="fill">
        버튼
      </Button>,
      "bg-semantic-fill-danger",
      "text-semantic-text-on-fill",
    ],
    [
      "danger weak",
      <Button key="8" color="danger" variant="weak">
        버튼
      </Button>,
      "bg-semantic-fill-danger-weak",
      "text-semantic-text-danger",
    ],
  ] as [string, ReactElement, string, string][])(
    "%s 조합이면 지정된 배경·텍스트 클래스가 적용된다",
    (_label, element, backgroundClass, textClass) => {
      render(element);
      const button = screen.getByRole("button", { name: "버튼" });

      expect(button.className).toContain(backgroundClass);
      expect(button.className).toContain(textClass);
    },
  );

  it.each([
    ["small", "h-8"],
    ["medium", "h-[38px]"],
    ["large", "h-12"],
    ["xlarge", "h-14"],
  ] as const)('size="%s"면 지정된 높이 클래스가 적용된다', (size, heightClass) => {
    render(<Button size={size}>버튼</Button>);

    expect(screen.getByRole("button", { name: "버튼" }).className).toContain(heightClass);
  });

  it("disabled=true면 버튼에 disabled 속성이 걸린다", () => {
    render(<Button disabled>버튼</Button>);

    expect(screen.getByRole("button", { name: "버튼" })).toBeDisabled();
  });

  it('states="loading"이면 disabled prop 없이도 disabled 속성이 걸린다', () => {
    render(<Button states="loading">버튼</Button>);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it.each([
    ["disabled", { disabled: true }],
    ["loading", { states: "loading" as const }],
  ])("%s 상태에서는 클릭해도 onClick이 호출되지 않는다", async (_label, extraProps) => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button onClick={handleClick} {...extraProps}>
        버튼
      </Button>,
    );

    await user.click(screen.getByRole("button"));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it.each([
    ["loading", "true"],
    ["default", "false"],
  ] as const)('states="%s"면 aria-busy가 "%s"이다', (states, expected) => {
    render(<Button states={states}>버튼</Button>);

    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", expected);
  });

  it('states="loading"이면 로딩 애니메이션이 렌더된다', () => {
    render(<Button states="loading">제출</Button>);
    const button = screen.getByRole("button");

    expect(button.querySelector("div")).not.toBeNull();
  });

  it('states="loading"이어도 children은 접근 가능한 이름으로 유지된다(시각적으로만 숨김)', () => {
    render(<Button states="loading">제출</Button>);

    expect(screen.getByRole("button", { name: "제출" })).toBeInTheDocument();
    expect(screen.getByText("제출").closest("span")).toHaveClass("sr-only");
  });

  it('states="loading"이면 leftIcon·rightIcon이 렌더되지 않는다', () => {
    render(
      <Button
        states="loading"
        leftIcon={<span data-testid="left-icon" />}
        rightIcon={<span data-testid="right-icon" />}>
        제출
      </Button>,
    );

    expect(screen.queryByTestId("left-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("right-icon")).not.toBeInTheDocument();
  });

  it("leftIcon을 전달하면 렌더된다", () => {
    render(<Button leftIcon={<span data-testid="left-icon" />}>버튼</Button>);

    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
  });

  it("leftIcon을 전달하지 않으면 렌더되지 않는다", () => {
    render(<Button>버튼</Button>);

    expect(screen.queryByTestId("left-icon")).not.toBeInTheDocument();
  });

  it("rightIcon을 전달하면 렌더된다", () => {
    render(<Button rightIcon={<span data-testid="right-icon" />}>버튼</Button>);

    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  it("rightIcon을 전달하지 않으면 렌더되지 않는다", () => {
    render(<Button>버튼</Button>);

    expect(screen.queryByTestId("right-icon")).not.toBeInTheDocument();
  });

  it("className prop이 기존 클래스와 함께 적용된다", () => {
    render(<Button className="mt-4">버튼</Button>);
    const button = screen.getByRole("button", { name: "버튼" });

    expect(button.className).toContain("mt-4");
    expect(button.className).toContain("rounded-full");
  });
});
