import { act, renderHook } from "@testing-library/react";

import { useFundingCloseToast } from "@/hooks/useFundingCloseToast";
import { useFundingCloseToastStore } from "@/store/fundingCloseToastStore";

describe("useFundingCloseToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useFundingCloseToastStore.setState({ pending: false });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("예약이 없으면 false다", () => {
    const { result } = renderHook(() => useFundingCloseToast());

    expect(result.current).toBe(false);
  });

  it("예약돼 있으면 true로 시작해 2초 뒤 사라지고 예약을 비운다", () => {
    useFundingCloseToastStore.getState().mark();

    const { result } = renderHook(() => useFundingCloseToast());

    expect(result.current).toBe(true);
    expect(useFundingCloseToastStore.getState().pending).toBe(false);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current).toBe(false);
  });
});
