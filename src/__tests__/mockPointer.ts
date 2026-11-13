// jsdom에는 matchMedia가 없어 기본은 마우스 환경이다. 터치 환경이 필요한 테스트에서 pointer 종류를 고정한다
export function mockPointer(type: "coarse" | "fine") {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: type === "coarse" && query === "(pointer: coarse)",
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}
