import { toBlob } from "html-to-image";

import { saveNodeAsImage } from "@/utils/saveNodeAsImage";

vi.mock("html-to-image", () => ({ toBlob: vi.fn() }));

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

  beforeEach(() => {
    vi.mocked(toBlob).mockResolvedValue(new Blob(["png"], { type: "image/png" }));
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

  it("이미지 생성 결과가 없으면 에러를 던진다", async () => {
    vi.mocked(toBlob).mockResolvedValue(null);

    await expect(saveNodeAsImage(node, FILENAME)).rejects.toThrow();
  });
});
