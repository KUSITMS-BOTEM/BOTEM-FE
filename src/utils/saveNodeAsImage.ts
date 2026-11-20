import { toBlob } from "html-to-image";

const IMAGE_PIXEL_RATIO = 2;

// 데스크탑 Chrome·Safari도 파일 공유를 지원해 그대로 두면 다운로드 대신 OS 공유창(AirDrop 등)이 뜬다. 터치 기기에서만 공유창을 쓴다
const isTouchDevice = () =>
  typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;

// 모바일에서 공유창을 열 수 있으면 거기서 사진 앱에 저장하게 하고, 아니면 PNG 파일로 내려받는다
export async function saveNodeAsImage(node: HTMLElement, filename: string) {
  const blob = await toBlob(node, { pixelRatio: IMAGE_PIXEL_RATIO, cacheBust: true });
  if (!blob) throw new Error("이미지를 만들지 못했어요");

  const file = new File([blob], filename, { type: "image/png" });
  if (isTouchDevice() && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (error) {
      // 사용자가 공유창을 닫은 경우다. 그 외 실패는 파일 다운로드로 넘어간다
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
