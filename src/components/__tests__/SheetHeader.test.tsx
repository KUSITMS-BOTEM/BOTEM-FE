import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SheetHeader from "@/components/SheetHeader";

describe("SheetHeader", () => {
  it("title prop이 화면에 보인다", () => {
    render(<SheetHeader title="타이틀" onClose={vi.fn()} />);

    expect(screen.getByText("타이틀")).toBeInTheDocument();
  });

  it("title이 빈 문자열이어도 에러 없이 렌더링된다", () => {
    render(<SheetHeader title="" onClose={vi.fn()} />);

    expect(screen.getByRole("button", { name: "닫기" })).toBeInTheDocument();
  });

  it("닫기 버튼을 클릭하면 onClose가 1번 호출된다", async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    render(<SheetHeader title="타이틀" onClose={handleClose} />);

    await user.click(screen.getByRole("button", { name: "닫기" }));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("rightAction이 있으면 닫기 버튼과 함께 렌더링된다", () => {
    render(
      <SheetHeader title="" onClose={vi.fn()} rightAction={<button type="button">공유</button>} />,
    );

    expect(screen.getByRole("button", { name: "공유" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "닫기" })).toBeInTheDocument();
  });

  it("handle 타입은 기본으로 닫기 버튼이 없다", () => {
    render(<SheetHeader title="타이틀" type="handle" onClose={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "닫기" })).not.toBeInTheDocument();
  });

  it("handle 타입에 showHandleClose를 주면 닫기 버튼으로 onClose를 호출한다", async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    render(<SheetHeader title="타이틀" type="handle" showHandleClose onClose={handleClose} />);

    await user.click(screen.getByRole("button", { name: "닫기" }));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("showHandle을 생략하면 드래그 핸들이 보인다", () => {
    const { container } = render(<SheetHeader title="타이틀" onClose={vi.fn()} />);

    expect(container.querySelector(".bg-semantic-border-default")).toBeInTheDocument();
  });

  it("showHandle이 false면 드래그 핸들이 보이지 않는다", () => {
    const { container } = render(
      <SheetHeader title="타이틀" onClose={vi.fn()} showHandle={false} />,
    );

    expect(container.querySelector(".bg-semantic-border-default")).not.toBeInTheDocument();
  });
});
