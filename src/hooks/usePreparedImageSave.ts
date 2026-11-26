import { useEffect, useRef, type RefObject } from "react";

import { createImageFile, shareOrDownloadImage } from "@/utils/saveNodeAsImage";

type PreparedImageSaveOptions = {
  /** false면 미리 만들지 않는다. 시트가 닫혀 있거나 카드가 아직 없을 때 */
  enabled?: boolean;
  /** 카드 등장 모션이 끝난 모습을 담으려고 기다리는 시간 */
  delayMs?: number;
  /** 카드 내용이 늦게 채워지면(프로필 조회 등) 바뀔 때마다 다시 만든다 */
  contentKey?: string;
};

// 공유창은 클릭 직후에만 열려서, 클릭 뒤에 이미지를 만들면 늦어 NotAllowedError로 막힌다. 카드가 보이면 미리 만들어 두고 클릭 때 바로 넘긴다
export function usePreparedImageSave(
  nodeRef: RefObject<HTMLElement | null>,
  filename: string,
  { enabled = true, delayMs = 0, contentKey }: PreparedImageSaveOptions = {},
) {
  const fileRef = useRef<File | null>(null);
  const pendingRef = useRef<Promise<File | null> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!nodeRef.current) return;
      pendingRef.current = createImageFile(nodeRef.current, filename)
        .then(file => {
          if (!cancelled) fileRef.current = file;
          return file;
        })
        .catch(() => null);
    }, delayMs);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      fileRef.current = null;
      pendingRef.current = null;
    };
  }, [nodeRef, filename, enabled, delayMs, contentKey]);

  // 실패하면 던진다. 안내는 호출한 화면이 맡는다
  return async () => {
    if (!nodeRef.current) return;
    // 미리 만든 파일이 없으면 만드는 중인 것을 기다리고, 그것도 없거나 실패했을 때만 지금 만든다. 이 경우 공유창이 막히면 PNG 다운로드로 넘어간다
    const file =
      fileRef.current ??
      (await pendingRef.current) ??
      (await createImageFile(nodeRef.current, filename));
    await shareOrDownloadImage(file);
  };
}
