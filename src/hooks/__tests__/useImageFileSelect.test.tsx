import { act, renderHook } from "@testing-library/react";
import type { ChangeEvent } from "react";

import { useImageFileSelect } from "@/hooks/useImageFileSelect";

const changeEvent = (file: File) =>
  ({ target: { files: [file], value: "x" } }) as unknown as ChangeEvent<HTMLInputElement>;

const imageFile = (type = "image/png", size = 1) => new File([new Uint8Array(size)], "a", { type });

describe("useImageFileSelect", () => {
  beforeEach(() => {
    global.createImageBitmap = vi
      .fn()
      .mockResolvedValue({ close: vi.fn() }) as unknown as typeof createImageBitmap;
  });

  it("검증을 통과한 파일만 onSelect로 넘기고 input 값을 비운다", async () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useImageFileSelect({ onSelect }));
    const file = imageFile();
    const event = changeEvent(file);

    await act(() => result.current.handleFileChange(event));

    expect(onSelect).toHaveBeenCalledWith(file);
    expect(event.target.value).toBe("");
    expect(result.current.errorText).toBeNull();
  });

  it("allowedTypes에 없는 형식은 거절하고 jpeg를 jpg로 표기한다", async () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useImageFileSelect({ allowedTypes: ["image/jpeg", "image/png"], onSelect }),
    );

    await act(() => result.current.handleFileChange(changeEvent(imageFile("image/gif"))));

    expect(result.current.errorText).toBe("jpg, png 파일만 올릴 수 있어요");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("maxSizeBytes를 넘는 파일은 거절한다", async () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useImageFileSelect({ maxSizeBytes: 5 * 1024 * 1024, onSelect }),
    );

    await act(() =>
      result.current.handleFileChange(changeEvent(imageFile("image/png", 6 * 1024 * 1024))),
    );

    expect(result.current.errorText).toBe("5MB 이하의 파일만 올릴 수 있어요");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("디코딩에 실패하면 거절한다", async () => {
    global.createImageBitmap = vi
      .fn()
      .mockRejectedValue(new Error("decode")) as unknown as typeof createImageBitmap;
    const onSelect = vi.fn();
    const { result } = renderHook(() => useImageFileSelect({ onSelect }));

    await act(() => result.current.handleFileChange(changeEvent(imageFile())));

    expect(result.current.errorText).toContain("이미지를 불러올 수 없어요");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("디코딩이 끝나는 순서가 뒤바뀌어도 마지막에 고른 파일만 반영한다", async () => {
    let resolveFirst: (bitmap: { close: () => void }) => void = () => {};
    global.createImageBitmap = vi
      .fn()
      .mockImplementationOnce(() => new Promise(resolve => (resolveFirst = resolve)))
      .mockResolvedValueOnce({ close: vi.fn() }) as unknown as typeof createImageBitmap;
    const onSelect = vi.fn();
    const { result } = renderHook(() => useImageFileSelect({ onSelect }));
    const first = imageFile();
    const second = imageFile();

    let firstDone: Promise<void> = Promise.resolve();
    act(() => {
      firstDone = result.current.handleFileChange(changeEvent(first));
    });
    await act(() => result.current.handleFileChange(changeEvent(second)));
    await act(async () => {
      resolveFirst({ close: vi.fn() });
      await firstDone;
    });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(second);
  });

  it("에러 문구는 일정 시간 뒤 사라진다", async () => {
    vi.useFakeTimers();
    try {
      const { result } = renderHook(() =>
        useImageFileSelect({ allowedTypes: ["image/png"], onSelect: vi.fn() }),
      );

      await act(() => result.current.handleFileChange(changeEvent(imageFile("image/gif"))));
      expect(result.current.errorText).not.toBeNull();

      act(() => {
        vi.advanceTimersByTime(2500);
      });

      expect(result.current.errorText).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});
