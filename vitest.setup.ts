/// <reference types="vitest/globals" />

import "@testing-library/jest-dom/vitest";

// jsdom에는 ResizeObserver가 없어 이를 쓰는 컴포넌트를 렌더하면 "ResizeObserver is not defined"로 실패한다
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = globalThis.ResizeObserver ?? ResizeObserverStub;

// jsdom에는 IntersectionObserver가 없어 이를 쓰는 컴포넌트를 렌더하면 throw한다
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.IntersectionObserver =
  globalThis.IntersectionObserver ??
  (IntersectionObserverStub as unknown as typeof IntersectionObserver);

// jsdom은 HTMLDialogElement의 showModal/close를 구현하지 않아 open 속성만 토글한다. 개별 테스트가 vi.fn으로 덮어써도 된다
// node 환경 테스트에는 DOM이 없다
if (typeof HTMLDialogElement !== "undefined") {
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}

// 날짜 휠 피커는 jsdom에서 조작할 수 없어 버튼으로 대체한다. 실제 휠 동작은 브라우저에서 확인한다
vi.mock("react-mobile-picker", () => import("@/__tests__/mockMobilePicker"));
