import { act, renderHook } from "@testing-library/react";

import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

class MockRecorder {
  static instance: MockRecorder | null = null;
  state: "inactive" | "recording" = "inactive";
  mimeType = "audio/webm";
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  constructor() {
    MockRecorder.instance = this;
  }
  start() {
    this.state = "recording";
  }
  stop() {
    this.state = "inactive";
    this.ondataavailable?.({ data: new Blob(["voice"]) });
    this.onstop?.();
  }
}

class MockRecognition {
  static instance: MockRecognition | null = null;
  lang = "";
  continuous = false;
  interimResults = false;
  onresult: ((event: unknown) => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();
  constructor() {
    MockRecognition.instance = this;
  }
}

const trackStop = vi.fn();
const getUserMedia = vi.fn();

const speechEvent = (results: { transcript: string; isFinal: boolean }[]) => ({
  resultIndex: 0,
  results: results.map(({ transcript, isFinal }) => ({ isFinal, 0: { transcript } })),
});

async function startRecording() {
  const hook = renderHook(() => useVoiceRecorder());
  await act(async () => {
    await hook.result.current.start();
  });
  return hook;
}

describe("useVoiceRecorder", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    MockRecorder.instance = null;
    MockRecognition.instance = null;
    trackStop.mockClear();
    getUserMedia.mockReset().mockResolvedValue({ getTracks: () => [{ stop: trackStop }] });
    vi.stubGlobal("MediaRecorder", MockRecorder);
    vi.stubGlobal("webkitSpeechRecognition", MockRecognition);
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("시작하면 녹음 중이 되고 정지하면 파일이 만들어지며 마이크를 놓는다", async () => {
    const { result } = await startRecording();
    expect(result.current.status).toBe("recording");
    expect(MockRecognition.instance?.lang).toBe("ko-KR");

    act(() => result.current.stop());

    expect(result.current.status).toBe("done");
    expect(result.current.blob).toBeInstanceOf(Blob);
    expect(result.current.blob?.type).toBe("audio/webm");
    expect(trackStop).toHaveBeenCalled();
  });

  it("인식된 문장은 확정 자막과 진행 중 자막으로 나뉜다", async () => {
    const { result } = await startRecording();

    act(() =>
      MockRecognition.instance?.onresult?.(
        speechEvent([
          { transcript: "생일 축하해", isFinal: true },
          { transcript: "그래서 내가", isFinal: false },
        ]),
      ),
    );

    expect(result.current.transcript).toBe("생일 축하해");
    expect(result.current.interim).toBe("그래서 내가");
  });

  it("음성 인식 결과가 오는 동안만 isSpeaking이고 잠시 끊기면 false가 된다", async () => {
    const { result } = await startRecording();
    expect(result.current.isSpeaking).toBe(false);

    act(() =>
      MockRecognition.instance?.onresult?.(speechEvent([{ transcript: "안녕", isFinal: false }])),
    );
    expect(result.current.isSpeaking).toBe(true);

    act(() => vi.advanceTimersByTime(800));
    expect(result.current.isSpeaking).toBe(false);
  });

  it("재녹음을 눌러도 마이크가 준비되기 전까지는 이전 자막과 파일을 유지한다", async () => {
    const { result } = await startRecording();
    act(() =>
      MockRecognition.instance?.onresult?.(speechEvent([{ transcript: "안녕", isFinal: true }])),
    );
    act(() => result.current.stop());
    expect(result.current.status).toBe("done");

    let resolveStream!: (stream: unknown) => void;
    getUserMedia.mockReturnValueOnce(new Promise(resolve => (resolveStream = resolve)));
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.start();
    });

    expect(result.current.status).toBe("done");
    expect(result.current.transcript).toBe("안녕");

    await act(async () => {
      resolveStream({ getTracks: () => [{ stop: trackStop }] });
      await pending;
    });
    expect(result.current.status).toBe("recording");
    expect(result.current.transcript).toBe("");
  });

  it("침묵으로 인식이 끝나도 녹음 중이면 다시 시작한다", async () => {
    await startRecording();
    const recognition = MockRecognition.instance!;
    expect(recognition.start).toHaveBeenCalledTimes(1);

    act(() => recognition.onend?.());

    expect(recognition.start).toHaveBeenCalledTimes(2);
  });

  it("30초가 지나면 자동으로 정지한다", async () => {
    const { result } = await startRecording();

    act(() => {
      vi.advanceTimersByTime(29_000);
    });
    expect(result.current.status).toBe("recording");
    expect(result.current.remainingSeconds).toBe(1);

    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(result.current.status).toBe("done");
  });

  it("마이크 권한을 거부하면 denied 에러이고 녹음을 시작하지 않는다", async () => {
    getUserMedia.mockRejectedValue(new DOMException("denied", "NotAllowedError"));

    const { result } = await startRecording();

    expect(result.current.error).toBe("denied");
    expect(result.current.status).toBe("idle");
  });

  it("음성 인식을 지원하지 않으면 unsupported 에러이고 시작해도 아무 일도 없다", async () => {
    vi.stubGlobal("webkitSpeechRecognition", undefined);

    const { result } = await startRecording();

    expect(result.current.error).toBe("unsupported");
    expect(result.current.status).toBe("idle");
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it("reset하면 녹음과 자막을 버리고 처음 상태로 돌아간다", async () => {
    const { result } = await startRecording();
    act(() =>
      MockRecognition.instance?.onresult?.(speechEvent([{ transcript: "안녕", isFinal: true }])),
    );
    act(() => result.current.stop());

    act(() => result.current.reset());

    expect(result.current.status).toBe("idle");
    expect(result.current.blob).toBeNull();
    expect(result.current.transcript).toBe("");
    expect(result.current.remainingSeconds).toBe(30);
  });

  it("녹음 중에 언마운트되면 마이크를 놓는다", async () => {
    const { unmount } = await startRecording();

    unmount();

    expect(trackStop).toHaveBeenCalled();
  });
});
