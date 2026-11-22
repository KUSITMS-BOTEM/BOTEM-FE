import { act, renderHook } from "@testing-library/react";

import { useAudioPlayback } from "@/hooks/useAudioPlayback";

type FakePlayer = {
  pause: ReturnType<typeof vi.fn>;
  play: ReturnType<typeof vi.fn>;
  onended?: () => void;
  onerror?: () => void;
};

const players: FakePlayer[] = [];

beforeEach(() => {
  players.length = 0;
  URL.createObjectURL = vi.fn(() => "blob:x");
  URL.revokeObjectURL = vi.fn();
  vi.stubGlobal(
    "Audio",
    vi.fn(function () {
      const player: FakePlayer = { pause: vi.fn(), play: vi.fn(() => Promise.resolve()) };
      players.push(player);
      return player;
    }),
  );
});

afterEach(() => vi.unstubAllGlobals());

describe("useAudioPlayback", () => {
  it("문자열 주소는 그대로 재생하고 object URL을 만들지 않는다", () => {
    const { result } = renderHook(() => useAudioPlayback("https://cdn.example.com/a.wav"));

    act(() => result.current.toggle());

    expect(Audio).toHaveBeenCalledWith("https://cdn.example.com/a.wav");
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(result.current.isPlaying).toBe(true);
  });

  it("Blob은 object URL로 재생하고 멈출 때 해제한다", () => {
    const { result } = renderHook(() => useAudioPlayback(new Blob(["a"])));

    act(() => result.current.toggle());
    expect(Audio).toHaveBeenCalledWith("blob:x");

    act(() => result.current.toggle());
    expect(players[0].pause).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:x");
    expect(result.current.isPlaying).toBe(false);
  });

  it("재생이 끝나면 재생 중 상태가 풀린다", () => {
    const { result } = renderHook(() => useAudioPlayback("https://cdn.example.com/a.wav"));
    act(() => result.current.toggle());

    act(() => players[0].onended?.());

    expect(result.current.isPlaying).toBe(false);
  });

  it("재생에 실패하면 재생 중 상태가 풀린다", async () => {
    const { result } = renderHook(() => useAudioPlayback("https://cdn.example.com/a.wav"));
    act(() => result.current.toggle());

    await act(async () => players[0].onerror?.());

    expect(result.current.isPlaying).toBe(false);
  });

  it("source가 없으면 아무것도 재생하지 않는다", () => {
    const { result } = renderHook(() => useAudioPlayback(undefined));

    act(() => result.current.toggle());

    expect(Audio).not.toHaveBeenCalled();
    expect(result.current.isPlaying).toBe(false);
  });

  it("source가 바뀌거나 언마운트되면 재생을 멈춘다", () => {
    const { result, rerender, unmount } = renderHook(({ source }) => useAudioPlayback(source), {
      initialProps: { source: "https://cdn.example.com/a.wav" },
    });
    act(() => result.current.toggle());

    rerender({ source: "https://cdn.example.com/b.wav" });
    expect(players[0].pause).toHaveBeenCalled();
    expect(result.current.isPlaying).toBe(false);

    act(() => result.current.toggle());
    unmount();
    expect(players[1].pause).toHaveBeenCalled();
  });
});
