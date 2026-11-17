import { fireEvent, render, screen } from "@testing-library/react";

import { useDragScroll } from "@/hooks/useDragScroll";

function Harness({ onItemClick }: { onItemClick: () => void }) {
  const dragScroll = useDragScroll<HTMLUListElement>();
  return (
    <ul data-testid="list" {...dragScroll}>
      <li>
        <button type="button" onClick={onItemClick}>
          항목
        </button>
      </li>
    </ul>
  );
}

const mouse = (clientX: number) => ({ pointerType: "mouse", clientX });

describe("useDragScroll", () => {
  it("마우스로 왼쪽으로 끌면 그만큼 scrollLeft가 늘어난다", () => {
    render(<Harness onItemClick={vi.fn()} />);
    const list = screen.getByTestId("list");

    fireEvent.pointerDown(list, mouse(100));
    fireEvent.pointerMove(list, mouse(60));

    expect(list.scrollLeft).toBe(40);
  });

  it("터치 포인터는 직접 스크롤하지 않는다(브라우저 기본 스크롤에 맡긴다)", () => {
    render(<Harness onItemClick={vi.fn()} />);
    const list = screen.getByTestId("list");

    fireEvent.pointerDown(list, { pointerType: "touch", clientX: 100 });
    fireEvent.pointerMove(list, { pointerType: "touch", clientX: 60 });

    expect(list.scrollLeft).toBe(0);
  });

  it("버튼을 끈 뒤 떼면 클릭이 억제되고 다음 클릭은 정상 동작한다", () => {
    const onItemClick = vi.fn();
    render(<Harness onItemClick={onItemClick} />);
    const button = screen.getByRole("button", { name: "항목" });

    fireEvent.pointerDown(button, mouse(0));
    fireEvent.pointerMove(button, mouse(20));
    fireEvent.pointerUp(button, mouse(20));
    fireEvent.click(button);
    expect(onItemClick).not.toHaveBeenCalled();

    fireEvent.click(button);
    expect(onItemClick).toHaveBeenCalledTimes(1);
  });

  it("보조 버튼으로 끈 뒤에도 다음 클릭은 억제되지 않는다", () => {
    const onItemClick = vi.fn();
    render(<Harness onItemClick={onItemClick} />);
    const list = screen.getByTestId("list");
    const button = screen.getByRole("button", { name: "항목" });

    fireEvent.pointerDown(list, { ...mouse(100), button: 1 });
    fireEvent.pointerMove(list, mouse(60));
    fireEvent.pointerUp(list, mouse(60));
    fireEvent.click(button);

    expect(list.scrollLeft).toBe(0);
    expect(onItemClick).toHaveBeenCalledTimes(1);
  });

  it("취소된 드래그 뒤에도 다음 클릭은 억제되지 않는다", () => {
    const onItemClick = vi.fn();
    render(<Harness onItemClick={onItemClick} />);
    const button = screen.getByRole("button", { name: "항목" });

    fireEvent.pointerDown(button, mouse(0));
    fireEvent.pointerMove(button, mouse(20));
    fireEvent.pointerCancel(button, mouse(20));
    fireEvent.click(button);

    expect(onItemClick).toHaveBeenCalledTimes(1);
  });

  it("임계값 이하로만 움직이면 단순 클릭으로 처리한다", () => {
    const onItemClick = vi.fn();
    render(<Harness onItemClick={onItemClick} />);
    const button = screen.getByRole("button", { name: "항목" });

    fireEvent.pointerDown(button, mouse(0));
    fireEvent.pointerMove(button, mouse(2));
    fireEvent.pointerUp(button, mouse(2));
    fireEvent.click(button);

    expect(onItemClick).toHaveBeenCalledTimes(1);
  });
});
