import { toSvg } from "html-to-image";

// 카드의 CSS 너비가 320~400px라 2배는 휴대폰 화면 폭보다 작아 확대돼 흐려진다
const IMAGE_PIXEL_RATIO = 4;
// WebKit은 SVG 안의 사진을 처음 그릴 때에야 디코딩하고 끝났다는 신호도 없어, 한 번 그린 뒤 기다렸다가 다시 그린다
// shortcut: 데스크탑 WebKit에서 3000px 사진으로 잰 값이다. 실기기에서 사진이 빠지면 늘린다
const IMAGE_DECODE_WAIT_MS = 500;

// 데스크탑 Chrome·Safari도 파일 공유를 지원해 그대로 두면 다운로드 대신 OS 공유창(AirDrop 등)이 뜬다. 터치 기기에서만 공유창을 쓴다
const isTouchDevice = () =>
  typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;

async function renderNodeToBlob(node: HTMLElement) {
  const image = new Image();
  image.src = await toSvg(node, { cacheBust: true });
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = node.offsetWidth * IMAGE_PIXEL_RATIO;
  canvas.height = node.offsetHeight * IMAGE_PIXEL_RATIO;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const draw = () => context.drawImage(image, 0, 0, canvas.width, canvas.height);

  draw();
  await new Promise(resolve => setTimeout(resolve, IMAGE_DECODE_WAIT_MS));
  // 반투명한 둥근 모서리가 겹쳐 진해지지 않게 지우고 다시 그린다
  context.clearRect(0, 0, canvas.width, canvas.height);
  draw();
  return new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
}

export async function createImageFile(node: HTMLElement, filename: string) {
  const blob = await renderNodeToBlob(node);
  if (!blob) throw new Error("이미지를 만들지 못했어요");
  return new File([blob], filename, { type: "image/png" });
}

// 공유창은 클릭 직후(사용자 활성화가 살아 있을 때)에만 열린다. 이미지 생성을 기다린 뒤 부르면 NotAllowedError로 막히므로,
// 클릭에서 공유창을 띄우려면 미리 만든 파일을 넘겨 다른 await 없이 바로 호출해야 한다
export async function shareOrDownloadImage(file: File) {
  if (isTouchDevice() && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (error) {
      // 사용자가 공유창을 닫은 경우다. 그 외 실패는 파일 다운로드로 넘어간다
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }

  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
}

// 모바일에서 공유창을 열 수 있으면 거기서 사진 앱에 저장하게 하고, 아니면 PNG 파일로 내려받는다
export async function saveNodeAsImage(node: HTMLElement, filename: string) {
  await shareOrDownloadImage(await createImageFile(node, filename));
}
