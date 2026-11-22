import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import type { LetterPaperProps } from "@/widgets/letter-paper/LetterPaper";
import RollingPaperWheel from "@/widgets/rolling-paper/RollingPaperWheel";
import type { RollingPaperVoice } from "@/widgets/rolling-paper/toRollingPaperVoice";

const toVoices = (count: number): RollingPaperVoice[] =>
  Array.from({ length: count }, (_, index) => ({
    url: `https://cdn.example.com/voice-${index}.wav`,
    durationSeconds: 8,
    transcript: `자막 ${index + 1}`,
    senderName: `친구${index + 1}`,
  }));

const toLetters = (count: number): LetterPaperProps[] =>
  Array.from({ length: count }, (_, index) => ({
    text: `축하해 ${index + 1}`,
    senderName: `친구${index + 1}`,
  }));

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
    render(<RollingPaperWheel letters={toLetters(5)} voices={toVoices(5)} />);

    expect(screen.getAllByTestId("wheel-card")).toHaveLength(5);
    expect(screen.getAllByTestId("wheel-profile")).toHaveLength(5);
  });

  it("터치 스크롤과 충돌하지 않도록 touch-none을 쓴다", () => {
    render(<RollingPaperWheel letters={toLetters(5)} voices={toVoices(5)} />);

    expect(screen.getByTestId("rolling-paper-wheel")).toHaveClass("touch-none");
  });

  it("세로로 끌면 편지지와 프로필이 함께 움직인다", async () => {
    render(<RollingPaperWheel letters={toLetters(5)} voices={toVoices(5)} />);
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
    render(<RollingPaperWheel letters={toLetters(5)} voices={toVoices(5)} />);
    const wheel = screen.getByTestId("rolling-paper-wheel");
    const before = screen.getAllByTestId("wheel-card")[1].style.transform;

    fireEvent.pointerMove(wheel, { pointerId: 1, clientY: 460 });

    expect(screen.getAllByTestId("wheel-card")[1].style.transform).toBe(before);
  });

  it("손을 떼도 예외 없이 스냅 동작이 시작된다", () => {
    render(<RollingPaperWheel letters={toLetters(5)} voices={toVoices(5)} />);

    expect(() => dragVertically(screen.getByTestId("rolling-paper-wheel"), 100)).not.toThrow();
  });

  it("5개 미만이면 그 개수만큼만 그린다", () => {
    render(<RollingPaperWheel letters={toLetters(3)} voices={toVoices(3)} />);

    expect(screen.getAllByTestId("wheel-card")).toHaveLength(3);
    expect(screen.getAllByTestId("wheel-profile")).toHaveLength(3);
  });

  it("5개 미만은 첫 장에서 아래로 끌어도 넘어가지 않고 위로 끌면 움직인다", async () => {
    render(<RollingPaperWheel letters={toLetters(2)} voices={toVoices(2)} />);
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
    render(<RollingPaperWheel letters={toLetters(3)} voices={toVoices(3)} />);
    const wheel = screen.getByTestId("rolling-paper-wheel");
    const before = screen.getAllByTestId("wheel-card")[1].style.transform;

    expect(wheel).toHaveAttribute("tabindex", "0");
    fireEvent.keyDown(wheel, { key: "ArrowDown" });

    await waitFor(() =>
      expect(screen.getAllByTestId("wheel-card")[1].style.transform).not.toBe(before),
    );
  });

  it("첫 카드에서 위 방향키나 그 외 키는 움직이지 않는다", async () => {
    render(<RollingPaperWheel letters={toLetters(3)} voices={toVoices(3)} />);
    const wheel = screen.getByTestId("rolling-paper-wheel");
    const before = screen.getAllByTestId("wheel-card")[1].style.transform;

    fireEvent.keyDown(wheel, { key: "ArrowUp" });
    fireEvent.keyDown(wheel, { key: "Enter" });
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(screen.getAllByTestId("wheel-card")[1].style.transform).toBe(before);
  });

  it("가운데 편지지를 탭하면 Voice Player가 나타나고 바깥을 탭하면 닫힌다", () => {
    render(<RollingPaperWheel letters={toLetters(5)} voices={toVoices(5)} />);
    const voicePlayer = screen.getByTestId("voice-player");
    expect(voicePlayer).toHaveAttribute("aria-hidden", "true");

    fireEvent.click(screen.getAllByTestId("wheel-card")[0]);
    expect(voicePlayer).toHaveAttribute("aria-hidden", "false");

    fireEvent.click(screen.getByTestId("rolling-paper-wheel"));
    expect(voicePlayer).toHaveAttribute("aria-hidden", "true");
  });

  it("등장 모션이 끝나기 전에 가운데 편지지를 탭하면 확대되지 않는다", () => {
    reducedMotion = false;
    render(<RollingPaperWheel letters={toLetters(5)} voices={toVoices(5)} />);

    fireEvent.click(screen.getAllByTestId("wheel-card")[0]);

    expect(screen.getByTestId("voice-player")).toHaveAttribute("aria-hidden", "true");
  });

  it("위·아래 편지지를 탭하면 그 편지지가 가운데로 오고 확대되지는 않는다", async () => {
    render(<RollingPaperWheel letters={toLetters(5)} voices={toVoices(5)} />);
    const cards = screen.getAllByTestId("wheel-card");
    const centerTransform = cards[0].style.transform;

    fireEvent.click(cards[1]);

    await waitFor(() => expect(cards[1].style.transform).toBe(centerTransform), {
      timeout: 3000,
    });
    expect(screen.getByTestId("voice-player")).toHaveAttribute("aria-hidden", "true");
  });

  it("확대 중에 다른 편지지를 탭하면 가운데로 옮기지 않고 닫힌다", () => {
    render(<RollingPaperWheel letters={toLetters(5)} voices={toVoices(5)} />);
    const cards = screen.getAllByTestId("wheel-card");
    const before = cards[1].style.transform;
    fireEvent.click(cards[0]);

    fireEvent.click(cards[1]);

    expect(screen.getByTestId("voice-player")).toHaveAttribute("aria-hidden", "true");
    expect(cards[1].style.transform).toBe(before);
  });

  it("회전이 멈춰도 자동으로 확대되지 않고 탭해야만 확대된다", async () => {
    render(<RollingPaperWheel letters={toLetters(5)} voices={toVoices(5)} />);
    const before = screen.getAllByTestId("wheel-card")[1].style.transform;
    dragVertically(screen.getByTestId("rolling-paper-wheel"), 100);

    await waitFor(() =>
      expect(screen.getAllByTestId("wheel-card")[1].style.transform).not.toBe(before),
    );

    expect(screen.getByTestId("voice-player")).toHaveAttribute("aria-hidden", "true");
  });

  it("드래그 직후 이어지는 click은 탭으로 보지 않는다", () => {
    render(<RollingPaperWheel letters={toLetters(5)} voices={toVoices(5)} />);
    dragVertically(screen.getByTestId("rolling-paper-wheel"), 100);

    fireEvent.click(screen.getAllByTestId("wheel-card")[0]);

    expect(screen.getByTestId("voice-player")).toHaveAttribute("aria-hidden", "true");
  });

  it("6px 미만으로 움직인 뒤의 click은 탭으로 보고 확대한다", () => {
    render(<RollingPaperWheel letters={toLetters(5)} voices={toVoices(5)} />);
    dragVertically(screen.getByTestId("rolling-paper-wheel"), 5);

    fireEvent.click(screen.getAllByTestId("wheel-card")[0]);

    expect(screen.getByTestId("voice-player")).toHaveAttribute("aria-hidden", "false");
  });

  it("Enter로 확대하고 Escape로 닫는다", () => {
    render(<RollingPaperWheel letters={toLetters(5)} voices={toVoices(5)} />);
    const wheel = screen.getByTestId("rolling-paper-wheel");

    fireEvent.keyDown(wheel, { key: "Enter" });
    expect(screen.getByTestId("voice-player")).toHaveAttribute("aria-hidden", "false");

    fireEvent.keyDown(wheel, { key: "Escape" });
    expect(screen.getByTestId("voice-player")).toHaveAttribute("aria-hidden", "true");
  });

  it("확대 중에는 드래그해도 휠이 움직이지 않는다", () => {
    render(<RollingPaperWheel letters={toLetters(5)} voices={toVoices(5)} />);
    const wheel = screen.getByTestId("rolling-paper-wheel");
    fireEvent.keyDown(wheel, { key: "Enter" });
    const before = screen.getAllByTestId("wheel-card")[1].style.transform;

    dragVertically(wheel, 100);

    expect(screen.getAllByTestId("wheel-card")[1].style.transform).toBe(before);
  });

  describe("Voice Player", () => {
    const players: { pause: ReturnType<typeof vi.fn> }[] = [];

    beforeEach(() => {
      players.length = 0;
      vi.stubGlobal(
        "Audio",
        vi.fn(function () {
          const player = { pause: vi.fn(), play: vi.fn(() => Promise.resolve()) };
          players.push(player);
          return player;
        }),
      );
    });

    afterEach(() => vi.unstubAllGlobals());

    const expand = () => fireEvent.click(screen.getAllByTestId("wheel-card")[0]);

    it("확대하면 가운데 편지지의 음성 자막과 길이·보낸 사람을 보여준다", () => {
      render(<RollingPaperWheel letters={toLetters(5)} voices={toVoices(5)} />);

      expand();

      const voicePlayer = screen.getByTestId("voice-player");
      expect(voicePlayer).toHaveTextContent("자막 1");
      expect(voicePlayer).toHaveTextContent("8초 · 친구1님의 녹음");
    });

    it("재생 버튼을 누르면 음성 주소를 재생하고 정지 버튼으로 바뀌며, 다시 누르면 멈춘다", async () => {
      render(<RollingPaperWheel letters={toLetters(5)} voices={toVoices(5)} />);
      expand();

      fireEvent.click(screen.getByRole("button", { name: "재생" }));

      expect(Audio).toHaveBeenCalledWith("https://cdn.example.com/voice-0.wav");
      fireEvent.click(await screen.findByRole("button", { name: "일시정지" }));
      expect(players[0].pause).toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "재생" })).toBeInTheDocument();
    });

    it("재생 중에 닫으면 재생을 멈춘다", async () => {
      render(<RollingPaperWheel letters={toLetters(5)} voices={toVoices(5)} />);
      expand();
      fireEvent.click(screen.getByRole("button", { name: "재생" }));
      await screen.findByRole("button", { name: "일시정지" });

      fireEvent.click(screen.getByTestId("rolling-paper-wheel"));

      expect(players[0].pause).toHaveBeenCalled();
    });

    it("음성이 없는 편지지는 확대해도 Voice Player가 나타나지 않는다", () => {
      render(<RollingPaperWheel letters={toLetters(5)} voices={[null, null, null, null, null]} />);

      expand();

      expect(screen.getByTestId("voice-player")).toHaveAttribute("aria-hidden", "true");
    });

    it("자막이 없으면 자막 문단 없이 길이·보낸 사람만 보여준다", () => {
      const voices = toVoices(5).map(voice => ({ ...voice, transcript: null }));
      render(<RollingPaperWheel letters={toLetters(5)} voices={voices} />);

      expand();

      expect(screen.getByTestId("voice-player").querySelectorAll("p")).toHaveLength(1);
    });
  });

  it("마우스로 드래그해도 편지지 글자가 선택되지 않는다", () => {
    render(<RollingPaperWheel letters={toLetters(5)} voices={toVoices(5)} />);

    expect(screen.getByTestId("rolling-paper-wheel")).toHaveClass("select-none");
  });

  it("1개면 드래그해도 움직이지 않는다", () => {
    render(<RollingPaperWheel letters={toLetters(1)} voices={toVoices(1)} />);
    const wheel = screen.getByTestId("rolling-paper-wheel");
    const before = screen.getByTestId("wheel-card").style.transform;

    fireEvent.pointerDown(wheel, { pointerId: 1, clientY: 400 });
    fireEvent.pointerMove(wheel, { pointerId: 1, clientY: 300 });
    fireEvent.pointerMove(wheel, { pointerId: 1, clientY: 500 });

    expect(screen.getByTestId("wheel-card").style.transform).toBe(before);
  });
});
