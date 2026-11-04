import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ListHeader from "@/components/ListHeader";

describe("ListHeader", () => {
  it("title이 기본 h2 heading으로 렌더된다", () => {
    render(<ListHeader title="타이틀" />);

    expect(screen.getByRole("heading", { level: 2, name: "타이틀" })).toBeInTheDocument();
  });

  it('as="h3"면 h3 heading으로 렌더된다', () => {
    render(<ListHeader title="타이틀" as="h3" />);

    expect(screen.getByRole("heading", { level: 3, name: "타이틀" })).toBeInTheDocument();
  });

  it("rightItem이 없으면 버튼이 렌더되지 않는다", () => {
    render(<ListHeader title="타이틀" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("rightItem이 있으면 label 버튼이 렌더되고 클릭 시 onClick이 1회 호출된다", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<ListHeader title="타이틀" rightItem={{ label: "추가하기", onClick: handleClick }} />);

    await user.click(screen.getByRole("button", { name: "추가하기" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("bg를 생략하면 32px 높이에 배경이 없다", () => {
    render(<ListHeader title="타이틀" />);
    const container = screen.getByRole("heading").parentElement;

    expect(container?.className).toContain("h-8");
    expect(container?.className).not.toContain("bg-semantic-fill-neutral-weak");
  });

  it("bg가 true면 52px 높이에 배경·radius·좌우 패딩이 적용된다", () => {
    render(<ListHeader title="타이틀" bg />);
    const container = screen.getByRole("heading").parentElement;

    expect(container?.className).toContain("h-[52px]");
    expect(container?.className).toContain("bg-semantic-fill-neutral-weak");
    expect(container?.className).toContain("rounded-x-large");
    expect(container?.className).toContain("px-4");
    expect(container?.className).toContain("py-[16.5px]");
    expect(container?.className).not.toContain("h-8");
  });

  it("className prop이 기존 클래스와 함께 병합되어 적용된다", () => {
    render(<ListHeader title="타이틀" className="mt-4" />);
    const container = screen.getByRole("heading").parentElement;

    expect(container?.className).toContain("mt-4");
    expect(container?.className).toContain("h-8");
  });
});
