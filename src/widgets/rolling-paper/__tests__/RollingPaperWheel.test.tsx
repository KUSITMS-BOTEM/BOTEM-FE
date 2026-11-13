import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import RollingPaperWheel from "@/widgets/rolling-paper/RollingPaperWheel";

let reducedMotion = true;
vi.mock("framer-motion", async importOriginal => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return { ...actual, useReducedMotion: () => reducedMotion };
});

function dragVertically(wheel: HTMLElement, distance: number) {
  fireEvent.pointerDown(wheel, { pointerId: 1, clientY: 400 });
  fireEvent.pointerMove(wheel, { pointerId: 1, clientY: 400 + distance });
  fireEvent.pointerUp(wheel, { pointerId: 1, clientY: 400 + distance });
}

describe("RollingPaperWheel", () => {
  beforeEach(() => {
    reducedMotion = true;
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

  it("키보드로 포커스할 수 있고 아래 방향키로 다음 카드로 이동한다", async () => {
    render(<RollingPaperWheel count={3} />);
    const wheel = screen.getByTestId("rolling-paper-wheel");
    const before = screen.getAllByTestId("wheel-card")[1].style.transform;

    expect(wheel).toHaveAttribute("tabindex", "0");
    fireEvent.keyDown(wheel, { key: "ArrowDown" });

    await waitFor(() =>
      expect(screen.getAllByTestId("wheel-card")[1].style.transform).not.toBe(before),
    );
  });

  it("첫 카드에서 위 방향키나 그 외 키는 움직이지 않는다", async () => {
    render(<RollingPaperWheel count={3} />);
    const wheel = screen.getByTestId("rolling-paper-wheel");
    const before = screen.getAllByTestId("wheel-card")[1].style.transform;

    fireEvent.keyDown(wheel, { key: "ArrowUp" });
    fireEvent.keyDown(wheel, { key: "Enter" });
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(screen.getAllByTestId("wheel-card")[1].style.transform).toBe(before);
  });

  it("가운데 편지지를 탭하면 Voice Player가 나타나고 바깥을 탭하면 닫힌다", () => {
    render(<RollingPaperWheel count={5} />);
    const voicePlayer = screen.getByTestId("voice-player");
    expect(voicePlayer).toHaveAttribute("aria-hidden", "true");

    fireEvent.click(screen.getAllByTestId("wheel-card")[0]);
    expect(voicePlayer).toHaveAttribute("aria-hidden", "false");

    fireEvent.click(screen.getByTestId("rolling-paper-wheel"));
    expect(voicePlayer).toHaveAttribute("aria-hidden", "true");
  });

  it("등장 모션이 끝나기 전에 처음 보이는 가운데 편지지를 탭해도 확대된다", () => {
    reducedMotion = false;
    render(<RollingPaperWheel count={5} />);

    fireEvent.click(screen.getAllByTestId("wheel-card")[0]);

    expect(screen.getByTestId("voice-player")).toHaveAttribute("aria-hidden", "false");
  });

  it("위·아래 편지지를 탭하면 그 편지지가 가운데로 오고 확대되지는 않는다", async () => {
    render(<RollingPaperWheel count={5} />);
    const cards = screen.getAllByTestId("wheel-card");
    const centerTransform = cards[0].style.transform;

    fireEvent.click(cards[1]);

    await waitFor(() => expect(cards[1].style.transform).toBe(centerTransform), {
      timeout: 3000,
    });
    expect(screen.getByTestId("voice-player")).toHaveAttribute("aria-hidden", "true");
  });

  it("확대 중에 다른 편지지를 탭하면 가운데로 옮기지 않고 닫힌다", () => {
    render(<RollingPaperWheel count={5} />);
    const cards = screen.getAllByTestId("wheel-card");
    const before = cards[1].style.transform;
    fireEvent.click(cards[0]);

    fireEvent.click(cards[1]);

    expect(screen.getByTestId("voice-player")).toHaveAttribute("aria-hidden", "true");
    expect(cards[1].style.transform).toBe(before);
  });

  it("회전이 멈춰도 자동으로 확대되지 않고 탭해야만 확대된다", async () => {
    render(<RollingPaperWheel count={5} />);
    dragVertically(screen.getByTestId("rolling-paper-wheel"), 100);

    await new Promise(resolve => setTimeout(resolve, 1500));

    expect(screen.getByTestId("voice-player")).toHaveAttribute("aria-hidden", "true");
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
