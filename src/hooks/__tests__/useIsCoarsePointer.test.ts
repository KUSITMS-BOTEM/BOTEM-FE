import { renderHook } from "@testing-library/react";

import { mockPointer } from "@/__tests__/mockPointer";
import { useIsCoarsePointer } from "@/hooks/useIsCoarsePointer";

afterEach(() => vi.unstubAllGlobals());

describe("useIsCoarsePointer", () => {
  it("matchMedia가 없는 환경은 마우스로 본다", () => {
    const { result } = renderHook(() => useIsCoarsePointer());

    expect(result.current).toBe(false);
  });

  it("(pointer: coarse)가 일치하면 true다", () => {
    mockPointer("coarse");
    const { result } = renderHook(() => useIsCoarsePointer());

    expect(result.current).toBe(true);
  });

  it("(pointer: coarse)가 일치하지 않으면 false다", () => {
    mockPointer("fine");
    const { result } = renderHook(() => useIsCoarsePointer());

    expect(result.current).toBe(false);
  });
});
