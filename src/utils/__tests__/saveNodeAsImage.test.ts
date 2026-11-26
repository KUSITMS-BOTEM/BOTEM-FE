import { toSvg } from "html-to-image";

import { createImageFile, saveNodeAsImage, shareOrDownloadImage } from "@/utils/saveNodeAsImage";

vi.mock("html-to-image", () => ({ toSvg: vi.fn() }));

const FILENAME = "card.png";
const node = document.createElement("div");

const setShare = (share: ReturnType<typeof vi.fn> | undefined) => {
  Object.defineProperty(navigator, "canShare", {
    value: share && (() => true),
    configurable: true,
  });
  Object.defineProperty(navigator, "share", { value: share, configurable: true });
};

const setTouchDevice = (isTouch: boolean) => {
  window.matchMedia = vi.fn((query: string) => ({
    matches: isTouch && query === "(pointer: coarse)",
  })) as unknown as typeof window.matchMedia;
};

describe("saveNodeAsImage", () => {
  let clickSpy: ReturnType<typeof vi.spyOn>;
  const context = { drawImage: vi.fn(), clearRect: vi.fn() };
  const canvasToBlob = vi.fn<(callback: BlobCallback) => void>();

  beforeEach(() => {
    // jsdom에는 이미지 디코딩과 캔버스가 없다
    vi.mocked(toSvg).mockResolvedValue("data:image/svg+xml,");
    HTMLImageElement.prototype.decode = vi.fn().mockResolvedValue(undefined);
    context.drawImage.mockClear();
    context.clearRect.mockClear();
    canvasToBlob.mockClear();
    canvasToBlob.mockImplementation(callback => callback(new Blob(["png"], { type: "image/png" })));
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context as unknown as ReturnType<HTMLCanvasElement["getContext"]>,
    );
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(canvasToBlob);
    URL.createObjectURL = vi.fn(() => "blob:mock");
    URL.revokeObjectURL = vi.fn();
    clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    setTouchDevice(true);
  });

  afterEach(() => {
    setShare(undefined);
    vi.restoreAllMocks();
  });

  it("공유창으로 파일을 넘길 수 있으면 PNG 파일을 공유하고 다운로드는 하지 않는다", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    setShare(share);

    await saveNodeAsImage(node, FILENAME);

    const { files } = share.mock.calls[0][0] as { files: File[] };
    expect(files[0].name).toBe(FILENAME);
    expect(files[0].type).toBe("image/png");
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it("공유창을 쓸 수 없으면 지정한 파일명으로 PNG를 내려받는다", async () => {
    let downloadName = "";
    clickSpy.mockImplementation(function (this: HTMLAnchorElement) {
      downloadName = this.download;
    });

    await saveNodeAsImage(node, FILENAME);

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(downloadName).toBe(FILENAME);
  });

  it("마우스 기기(PC)면 공유창을 쓸 수 있어도 공유하지 않고 바로 PNG를 내려받는다", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    setShare(share);
    setTouchDevice(false);

    await saveNodeAsImage(node, FILENAME);

    expect(share).not.toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("사용자가 공유창을 닫으면 다운로드로 넘어가지 않는다", async () => {
    setShare(vi.fn().mockRejectedValue(new DOMException("취소", "AbortError")));

    await saveNodeAsImage(node, FILENAME);

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it("공유가 취소 외의 이유로 실패하면 다운로드로 넘어간다", async () => {
    setShare(vi.fn().mockRejectedValue(new DOMException("실패", "NotAllowedError")));

    await saveNodeAsImage(node, FILENAME);

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("상품 사진이 디코딩되도록 한 번 그리고 0.5초 뒤 지우고 다시 그린 결과를 파일로 만든다", async () => {
    vi.useFakeTimers();
    try {
      const file = createImageFile(node, FILENAME);

      await vi.advanceTimersByTimeAsync(499);
      expect(context.drawImage).toHaveBeenCalledTimes(1);
      expect(canvasToBlob).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      await file;
      const [first, second] = context.drawImage.mock.invocationCallOrder;
      const [cleared] = context.clearRect.mock.invocationCallOrder;
      expect(first).toBeLessThan(cleared);
      expect(cleared).toBeLessThan(second);
    } finally {
      vi.useRealTimers();
    }
  });

  it("이미지 생성 결과가 없으면 에러를 던진다", async () => {
    canvasToBlob.mockImplementation(callback => callback(null));

    await expect(saveNodeAsImage(node, FILENAME)).rejects.toThrow();
  });

  it("미리 만든 파일을 넘기면 이미지를 다시 만들지 않고 바로 공유한다", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    setShare(share);
    const file = new File(["png"], FILENAME, { type: "image/png" });
    vi.mocked(toSvg).mockClear();

    await shareOrDownloadImage(file);

    expect(toSvg).not.toHaveBeenCalled();
    expect(share).toHaveBeenCalledWith({ files: [file] });
  });
});
