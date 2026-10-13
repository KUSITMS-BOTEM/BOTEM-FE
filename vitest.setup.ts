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
