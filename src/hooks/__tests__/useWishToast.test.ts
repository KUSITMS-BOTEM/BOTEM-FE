import { act, renderHook } from "@testing-library/react";

import { useWishToast } from "@/hooks/useWishToast";
import { useWishToastStore } from "@/store/wishToastStore";

describe("useWishToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useWishToastStore.setState({ pending: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("예약이 없으면 false다", () => {
    const { result } = renderHook(() => useWishToast("added"));

    expect(result.current).toBe(false);
  });

  it("같은 종류가 예약돼 있으면 true로 시작해 1초 뒤 사라지고 예약을 비운다", () => {
    useWishToastStore.getState().mark("added");

    const { result } = renderHook(() => useWishToast("added"));

    expect(result.current).toBe(true);
    expect(useWishToastStore.getState().pending).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(false);
  });

  it("다른 종류가 예약돼 있으면 false이고 예약은 건드리지 않는다", () => {
    useWishToastStore.getState().mark("deleted");

    const { result } = renderHook(() => useWishToast("added"));

    expect(result.current).toBe(false);
    expect(useWishToastStore.getState().pending).toBe("deleted");
  });
});
