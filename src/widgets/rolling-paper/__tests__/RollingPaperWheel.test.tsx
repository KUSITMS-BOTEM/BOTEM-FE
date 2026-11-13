import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import RollingPaperWheel from "@/widgets/rolling-paper/RollingPaperWheel";

vi.mock("framer-motion", async importOriginal => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return { ...actual, useReducedMotion: () => true };
});

function dragVertically(wheel: HTMLElement, distance: number) {
  fireEvent.pointerDown(wheel, { pointerId: 1, clientY: 400 });
  fireEvent.pointerMove(wheel, { pointerId: 1, clientY: 400 + distance });
  fireEvent.pointerUp(wheel, { pointerId: 1, clientY: 400 + distance });
}

describe("RollingPaperWheel", () => {
  beforeEach(() => {
    // jsdom에는 PointerEvent가 없어 clientY가 전달되지 않는다
    vi.stubGlobal("PointerEvent", class extends MouseEvent {});
    Element.prototype.setPointerCapture = vi.fn();
  });

  it("편지지 5장과 프로필 5개를 그린다", () => {
    render(<RollingPaperWheel count={5} />);

    expect(screen.getAllByTestId("wheel-card")).toHaveLength(5);
    expect(screen.getAllByTestId("wheel-profile")).toHaveLength(5);
  });

  it("터치 스크롤과 충돌하지 않도록 touch-none을 쓴다", () => {
    render(<RollingPaperWheel count={5} />);

    expect(screen.getByTestId("rolling-paper-wheel")).toHaveClass("touch-none");
  });

  it("세로로 끌면 편지지와 프로필이 함께 움직인다", async () => {
    render(<RollingPaperWheel count={5} />);
    const wheel = screen.getByTestId("rolling-paper-wheel");
    const cardBefore = screen.getAllByTestId("wheel-card")[1].style.transform;
    const profileBefore = screen.getAllByTestId("wheel-profile")[1].style.transform;

    fireEvent.pointerDown(wheel, { pointerId: 1, clientY: 400 });
    fireEvent.pointerMove(wheel, { pointerId: 1, clientY: 460 });

    await waitFor(() => {
      expect(screen.getAllByTestId("wheel-card")[1].style.transform).not.toBe(cardBefore);
      expect(screen.getAllByTestId("wheel-profile")[1].style.transform).not.toBe(profileBefore);
    });
  });

  it("끌지 않고 움직이기만 하면 위치가 바뀌지 않는다", () => {
    render(<RollingPaperWheel count={5} />);
    const wheel = screen.getByTestId("rolling-paper-wheel");
    const before = screen.getAllByTestId("wheel-card")[1].style.transform;

    fireEvent.pointerMove(wheel, { pointerId: 1, clientY: 460 });

    expect(screen.getAllByTestId("wheel-card")[1].style.transform).toBe(before);
  });

  it("손을 떼도 예외 없이 스냅 동작이 시작된다", () => {
    render(<RollingPaperWheel count={5} />);

    expect(() => dragVertically(screen.getByTestId("rolling-paper-wheel"), 100)).not.toThrow();
  });

  it("5개 미만이면 그 개수만큼만 그린다", () => {
    render(<RollingPaperWheel count={3} />);

    expect(screen.getAllByTestId("wheel-card")).toHaveLength(3);
    expect(screen.getAllByTestId("wheel-profile")).toHaveLength(3);
  });

  it("5개 미만은 첫 장에서 아래로 끌어도 넘어가지 않고 위로 끌면 움직인다", async () => {
    render(<RollingPaperWheel count={2} />);
    const wheel = screen.getByTestId("rolling-paper-wheel");
    const before = screen.getAllByTestId("wheel-card")[1].style.transform;

    fireEvent.pointerDown(wheel, { pointerId: 1, clientY: 400 });
    fireEvent.pointerMove(wheel, { pointerId: 1, clientY: 460 });
    expect(screen.getAllByTestId("wheel-card")[1].style.transform).toBe(before);

    fireEvent.pointerMove(wheel, { pointerId: 1, clientY: 340 });
    await waitFor(() =>
      expect(screen.getAllByTestId("wheel-card")[1].style.transform).not.toBe(before),
    );
  });

  it("1개면 드래그해도 움직이지 않는다", () => {
    render(<RollingPaperWheel count={1} />);
    const wheel = screen.getByTestId("rolling-paper-wheel");
    const before = screen.getByTestId("wheel-card").style.transform;

    fireEvent.pointerDown(wheel, { pointerId: 1, clientY: 400 });
    fireEvent.pointerMove(wheel, { pointerId: 1, clientY: 300 });
    fireEvent.pointerMove(wheel, { pointerId: 1, clientY: 500 });

    expect(screen.getByTestId("wheel-card").style.transform).toBe(before);
  });
});
