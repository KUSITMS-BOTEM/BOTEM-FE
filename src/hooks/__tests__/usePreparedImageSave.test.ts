import { act, renderHook } from "@testing-library/react";

import { usePreparedImageSave } from "@/hooks/usePreparedImageSave";
import { createImageFile, shareOrDownloadImage } from "@/utils/saveNodeAsImage";

vi.mock("@/utils/saveNodeAsImage", () => ({
  createImageFile: vi.fn(),
  shareOrDownloadImage: vi.fn(),
}));

const FILENAME = "card.png";
const file = new File(["png"], FILENAME, { type: "image/png" });

type HookProps = {
  node: HTMLElement | null;
  options?: Parameters<typeof usePreparedImageSave>[2];
};

const renderPrepared = (initial: HookProps) =>
  renderHook(
    ({ node, options }: HookProps) => {
      const ref = { current: node };
      return usePreparedImageSave(ref, FILENAME, options);
    },
    { initialProps: initial },
  );

const flush = () =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });

describe("usePreparedImageSave", () => {
  const node = document.createElement("div");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(createImageFile).mockResolvedValue(file);
    vi.mocked(shareOrDownloadImage).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("delayMs가 지나면 카드 이미지를 미리 만든다", async () => {
    renderPrepared({ node, options: { delayMs: 1500 } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1499);
    });
    expect(createImageFile).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(createImageFile).toHaveBeenCalledWith(node, FILENAME);
  });

  it("미리 만든 뒤 저장하면 다시 만들지 않고 그 파일을 바로 넘긴다", async () => {
    const { result } = renderPrepared({ node });
    await flush();

    await act(() => result.current());

    expect(createImageFile).toHaveBeenCalledTimes(1);
    expect(shareOrDownloadImage).toHaveBeenCalledWith(file);
  });

  it("미리 만들기 전에 저장하면 그때 만들어 넘긴다", async () => {
    const { result } = renderPrepared({ node, options: { delayMs: 1500 } });

    await act(() => result.current());

    expect(createImageFile).toHaveBeenCalledTimes(1);
    expect(shareOrDownloadImage).toHaveBeenCalledWith(file);
  });

  it("enabled가 false면 미리 만들지 않는다", async () => {
    renderPrepared({ node, options: { enabled: false } });
    await flush();

    expect(createImageFile).not.toHaveBeenCalled();
  });

  it("contentKey가 바뀌면 바뀐 내용으로 다시 만든다", async () => {
    const newFile = new File(["new"], FILENAME, { type: "image/png" });
    const { result, rerender } = renderPrepared({ node, options: { contentKey: "내" } });
    await flush();

    vi.mocked(createImageFile).mockResolvedValue(newFile);
    rerender({ node, options: { contentKey: "민지" } });
    await flush();
    await act(() => result.current());

    expect(createImageFile).toHaveBeenCalledTimes(2);
    expect(shareOrDownloadImage).toHaveBeenCalledWith(newFile);
  });

  it("미리 만들기가 실패해도 에러를 내지 않고, 저장할 때 다시 만든다", async () => {
    vi.mocked(createImageFile).mockRejectedValueOnce(new Error("fail"));
    const { result } = renderPrepared({ node });
    await flush();

    await act(() => result.current());

    expect(createImageFile).toHaveBeenCalledTimes(2);
    expect(shareOrDownloadImage).toHaveBeenCalledWith(file);
  });

  it("저장할 때 이미지 생성이 실패하면 에러를 던진다", async () => {
    vi.mocked(createImageFile).mockRejectedValue(new Error("fail"));
    const { result } = renderPrepared({ node, options: { delayMs: 1500 } });

    await expect(result.current()).rejects.toThrow("fail");
  });

  it("카드 노드가 없으면 아무것도 하지 않는다", async () => {
    const { result } = renderPrepared({ node: null });
    await flush();

    await act(() => result.current());

    expect(createImageFile).not.toHaveBeenCalled();
    expect(shareOrDownloadImage).not.toHaveBeenCalled();
  });
});
