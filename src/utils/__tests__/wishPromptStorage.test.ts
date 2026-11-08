import { consumeWishPromptPending, markWishPromptPending } from "../wishPromptStorage";

beforeEach(() => {
  sessionStorage.clear();
});

describe("consumeWishPromptPending", () => {
  it("저장된 값이 없을 때 false를 반환한다", () => {
    expect(consumeWishPromptPending()).toBe(false);
  });

  it("markWishPromptPending 호출 후에는 true를 반환한다", () => {
    markWishPromptPending();

    expect(consumeWishPromptPending()).toBe(true);
  });

  it("한 번 호출하면 플래그가 제거돼 다음 호출은 false를 반환한다", () => {
    markWishPromptPending();

    consumeWishPromptPending();

    expect(consumeWishPromptPending()).toBe(false);
  });
});
