import { useRef, type MouseEvent, type PointerEvent } from "react";

const DRAG_THRESHOLD_PX = 5;

// 트랙패드·터치는 overflow-x-auto만으로 스크롤되지만, 데스크탑 마우스는 가로 휠/스와이프가 없어 드래그로도 스크롤되게 한다
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const dragStart = useRef<{ x: number; scrollLeft: number } | null>(null);
  const hasDragged = useRef(false);

  const onPointerDown = (event: PointerEvent<T>) => {
    if (event.pointerType !== "mouse" || !ref.current) return;
    dragStart.current = { x: event.clientX, scrollLeft: ref.current.scrollLeft };
    hasDragged.current = false;
  };

  const onPointerMove = (event: PointerEvent<T>) => {
    const el = ref.current;
    if (!el || !dragStart.current) return;
    const delta = event.clientX - dragStart.current.x;
    // 드래그로 확정된 순간에만 capture한다 — 처음부터 capture하면 단순 클릭의 click 대상이 컨테이너로 바뀌어 자식 버튼 클릭이 막힌다
    if (!hasDragged.current && Math.abs(delta) > DRAG_THRESHOLD_PX) {
      hasDragged.current = true;
      el.setPointerCapture?.(event.pointerId);
    }
    el.scrollLeft = dragStart.current.scrollLeft - delta;
  };

  const onPointerUp = (event: PointerEvent<T>) => {
    if (hasDragged.current) ref.current?.releasePointerCapture?.(event.pointerId);
    dragStart.current = null;
  };

  // 드래그 끝에 손을 뗀 지점의 자식에서 click이 발생해 의도치 않게 선택되는 것을 막는다. 억제 직후 바로 리셋해야 키보드·터치 클릭까지 막히지 않는다
  const onClickCapture = (event: MouseEvent<T>) => {
    if (!hasDragged.current) return;
    event.stopPropagation();
    event.preventDefault();
    hasDragged.current = false;
  };

  return {
    ref,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave: onPointerUp,
    onPointerCancel: onPointerUp,
    onClickCapture,
  };
}
