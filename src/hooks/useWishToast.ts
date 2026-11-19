import { useEffect, useState } from "react";

import { useWishToastStore, type WishToastKind } from "@/store/wishToastStore";

const WISH_TOAST_DURATION_MS = 1000;

// 이동해 온 직후에만 true. 초기값으로 읽고 새로고침·재방문엔 안 뜨도록 곧바로 비운다
export function useWishToast(kind: WishToastKind) {
  const [show, setShow] = useState(() => useWishToastStore.getState().pending === kind);

  useEffect(() => {
    useWishToastStore.getState().consume(kind);
  }, [kind]);

  // 소비 effect와 분리: StrictMode가 effect를 두 번 돌려도 타이머가 지워지지 않게 한다
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => setShow(false), WISH_TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [show]);

  return show;
}
