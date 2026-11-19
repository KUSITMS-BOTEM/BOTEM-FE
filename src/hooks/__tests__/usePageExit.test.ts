import { act, renderHook } from "@testing-library/react";

import { PAGE_EXIT_RECOVER_MS, usePageExit } from "@/hooks/usePageExit";

describe("usePageExit", () => {
  afterEach(() => {
    window.scrollY = 0;
  });

  it("처음에는 퇴장 상태가 없다", () => {
    const { result } = renderHook(() => usePageExit());

    expect(result.current.pageExit).toBeNull();
  });

  it("slide 퇴장을 요청하면 종류·이동 콜백·요청 시점 스크롤 위치를 담는다", () => {
    window.scrollY = 240;
    const onComplete = vi.fn();
    const { result } = renderHook(() => usePageExit());

    act(() => result.current.exitPage("slide", onComplete));

    expect(result.current.pageExit).toMatchObject({ type: "slide", scrollY: 240 });
    result.current.pageExit?.onComplete();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("fade 퇴장을 요청하면 fade로 담는다", () => {
    const { result } = renderHook(() => usePageExit());

    act(() => result.current.exitPage("fade", vi.fn()));

    expect(result.current.pageExit?.type).toBe("fade");
  });

  it("퇴장 중에 다시 요청해도 첫 요청을 유지한다", () => {
    const first = vi.fn();
    const { result } = renderHook(() => usePageExit());

    act(() => result.current.exitPage("slide", first));
    act(() => result.current.exitPage("fade", vi.fn()));

    expect(result.current.pageExit?.type).toBe("slide");
    result.current.pageExit?.onComplete();
    expect(first).toHaveBeenCalledTimes(1);
  });

  describe("이동 콜백을 호출한 뒤 페이지가 남아 있으면", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("복구 시간 전까지는 퇴장 상태를 유지한다", () => {
      const { result } = renderHook(() => usePageExit());

      act(() => result.current.exitPage("slide", vi.fn()));
      act(() => result.current.pageExit?.onComplete());
      act(() => vi.advanceTimersByTime(PAGE_EXIT_RECOVER_MS - 1));

      expect(result.current.pageExit).not.toBeNull();
    });

    it("복구 시간이 지나면 퇴장 상태를 되돌려 다시 요청할 수 있다", () => {
      const second = vi.fn();
      const { result } = renderHook(() => usePageExit());

      act(() => result.current.exitPage("slide", vi.fn()));
      act(() => result.current.pageExit?.onComplete());
      act(() => vi.advanceTimersByTime(PAGE_EXIT_RECOVER_MS));

      expect(result.current.pageExit).toBeNull();

      act(() => result.current.exitPage("fade", second));
      expect(result.current.pageExit?.type).toBe("fade");
    });
  });
});
