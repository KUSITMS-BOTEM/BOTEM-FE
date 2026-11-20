import { act, renderHook } from "@testing-library/react";

import { useFundingExtendToast } from "@/hooks/useFundingExtendToast";
import { useFundingExtendToastStore } from "@/store/fundingExtendToastStore";

describe("useFundingExtendToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useFundingExtendToastStore.setState({ pending: false });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("예약이 없으면 false다", () => {
    const { result } = renderHook(() => useFundingExtendToast());

    expect(result.current).toBe(false);
  });

  it("예약돼 있으면 true로 시작해 1초 뒤 사라지고 예약을 비운다", () => {
    useFundingExtendToastStore.getState().mark();

    const { result } = renderHook(() => useFundingExtendToast());

    expect(result.current).toBe(true);
    expect(useFundingExtendToastStore.getState().pending).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(false);
  });
});
