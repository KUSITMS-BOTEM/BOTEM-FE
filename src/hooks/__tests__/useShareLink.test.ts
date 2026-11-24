import { act, renderHook } from "@testing-library/react";

import { useShareLink } from "@/hooks/useShareLink";

const PAYLOAD = { title: "서프라이즈 펀딩", url: "https://botem.site/share/1" };

const originalShare = Object.getOwnPropertyDescriptor(navigator, "share");
const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
const define = (key: "share" | "clipboard", value: unknown) =>
  Object.defineProperty(navigator, key, { value, configurable: true, writable: true });

const runShare = async () => {
  const hook = renderHook(() => useShareLink());
  let shared: boolean | undefined;
  await act(async () => {
    shared = await hook.result.current.share(PAYLOAD);
  });
  return { ...hook, shared };
};

describe("useShareLink", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    for (const [key, original] of [
      ["share", originalShare],
      ["clipboard", originalClipboard],
    ] as const) {
      if (original) Object.defineProperty(navigator, key, original);
      else delete (navigator as unknown as Record<string, unknown>)[key];
    }
  });

  it("navigator.share가 성공하면 true를 돌려주고 복사도 토스트도 없다", async () => {
    const writeText = vi.fn();
    const share = vi.fn().mockResolvedValue(undefined);
    define("share", share);
    define("clipboard", { writeText });

    const { result, shared } = await runShare();

    expect(shared).toBe(true);
    expect(share).toHaveBeenCalledWith(PAYLOAD);
    expect(writeText).not.toHaveBeenCalled();
    expect(result.current.toast).toBeNull();
  });

  it("사용자가 공유창을 닫으면(AbortError) false를 돌려주고 복사하지 않고 토스트도 없다", async () => {
    const writeText = vi.fn();
    define("share", vi.fn().mockRejectedValue(new DOMException("취소", "AbortError")));
    define("clipboard", { writeText });

    const { result, shared } = await runShare();

    expect(shared).toBe(false);
    expect(writeText).not.toHaveBeenCalled();
    expect(result.current.toast).toBeNull();
  });

  it("navigator.share가 없으면 링크를 복사하고 success 토스트를 띄우며 false를 돌려준다", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    define("share", undefined);
    define("clipboard", { writeText });

    const { result, shared } = await runShare();

    expect(shared).toBe(false);
    expect(writeText).toHaveBeenCalledWith(PAYLOAD.url);
    expect(result.current.toast).toBe("success");
  });

  it("토스트는 2초 뒤에 사라진다", async () => {
    define("share", undefined);
    define("clipboard", { writeText: vi.fn().mockResolvedValue(undefined) });
    const { result } = await runShare();

    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(result.current.toast).toBe("success");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.toast).toBeNull();
  });

  it("링크 복사에 실패하면 fail 토스트를 띄운다", async () => {
    define("share", undefined);
    define("clipboard", { writeText: vi.fn().mockRejectedValue(new Error("거부")) });

    const { result } = await runShare();

    expect(result.current.toast).toBe("fail");
  });

  describe("copyLink", () => {
    it("공유창 없이 링크만 복사하고 success 토스트를 띄운다", async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      const share = vi.fn();
      define("share", share);
      define("clipboard", { writeText });
      const { result } = renderHook(() => useShareLink());

      await act(async () => {
        await result.current.copyLink(PAYLOAD.url);
      });

      expect(writeText).toHaveBeenCalledWith(PAYLOAD.url);
      expect(share).not.toHaveBeenCalled();
      expect(result.current.toast).toBe("success");
    });

    it("복사에 실패하면 fail 토스트를 띄운다", async () => {
      define("clipboard", { writeText: vi.fn().mockRejectedValue(new Error("거부")) });
      const { result } = renderHook(() => useShareLink());

      await act(async () => {
        await result.current.copyLink(PAYLOAD.url);
      });

      expect(result.current.toast).toBe("fail");
    });
  });

  it("공유가 AbortError가 아닌 이유로 실패하면 링크 복사로 넘어간다", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    define("share", vi.fn().mockRejectedValue(new Error("공유 실패")));
    define("clipboard", { writeText });

    const { result } = await runShare();

    expect(writeText).toHaveBeenCalledWith(PAYLOAD.url);
    expect(result.current.toast).toBe("success");
  });
});
