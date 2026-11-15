import { useSyncExternalStore } from "react";

const QUERY = "(pointer: coarse)";

const hasMatchMedia = () => typeof window.matchMedia === "function";

function subscribe(onChange: () => void) {
  if (!hasMatchMedia()) return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

// 화면 너비가 아니라 주 입력 장치로 판별한다. 서버·matchMedia 미지원 환경(jsdom)은 마우스로 본다
export function useIsCoarsePointer(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => hasMatchMedia() && window.matchMedia(QUERY).matches,
    () => false,
  );
}
